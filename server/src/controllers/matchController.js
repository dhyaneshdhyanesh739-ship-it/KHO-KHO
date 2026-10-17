import Match from '../models/Match.js';
import MatchSquad from '../models/MatchSquad.js';
import Player from '../models/Player.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Announcement from '../models/Announcement.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getMatches = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const { status, timeframe } = req.query;

    const filter = { team };
    if (status) filter.status = status;

    const now = new Date();
    if (timeframe === 'upcoming') {
      filter.matchDate = { $gte: now };
    } else if (timeframe === 'past') {
      filter.matchDate = { $lt: now };
    }

    const matches = await Match.find(filter)
      .sort({ matchDate: timeframe === 'past' ? -1 : 1 })
      .populate('squadRef')
      .populate('createdBy', 'name');

    return res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'squadRef',
        populate: [
          { path: 'selectedPlayers.player', select: 'name jerseyNumber position playerId photoUrl active contactInfo' },
          { path: 'reservePlayers.player', select: 'name jerseyNumber position playerId photoUrl active' },
          { path: 'finalizedBy', select: 'name' },
        ],
      });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && match.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden: Match belongs to another team.' });
    }

    return res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (req, res, next) => {
  try {
    const team = req.targetTeam;
    const {
      opponent,
      competition,
      venue,
      matchDate,
      squadSize,
      eligibilityMinAttendancePct = 75,
    } = req.body;

    if (!opponent || !competition || !venue || !matchDate) {
      return res.status(400).json({
        success: false,
        message: 'Opponent, competition, venue, and match date/time are required.',
      });
    }

    // Default squad size: 15 for Boys, configurable (default 14 or admin-specified) for Girls
    const finalSquadSize = squadSize ? Number(squadSize) : (team === 'BOYS' ? 15 : 14);

    if (finalSquadSize < 9 || finalSquadSize > 18) {
      return res.status(400).json({
        success: false,
        message: 'Squad size must be between 9 and 18 players according to regulation Kho-Kho rules.',
      });
    }

    const match = await Match.create({
      team,
      opponent: opponent.trim(),
      competition: competition.trim(),
      venue: venue.trim(),
      matchDate: new Date(matchDate),
      squadSize: finalSquadSize,
      eligibilityMinAttendancePct: Number(eligibilityMinAttendancePct),
      createdBy: req.user._id,
      status: 'SCHEDULED',
    });

    await logAuditEvent({
      actor: req.user,
      team,
      action: 'MATCH_CREATED',
      entity: 'MATCH',
      entityId: match._id.toString(),
      details: { opponent: match.opponent, competition: match.competition, squadSize: match.squadSize },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: `Match against ${match.opponent} created. Maximum squad limit set to ${match.squadSize} players.`,
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const getSquadRecommendations = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && match.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden: Match belongs to another team.' });
    }

    const { days = 30 } = req.query;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - parseInt(days, 10));
    const sinceStr = sinceDate.toISOString().slice(0, 10);

    // 1. Get all active players for the match's team
    const players = await Player.find({ team: match.team, active: true }).sort({ jerseyNumber: 1 });

    // 2. Fetch sessions in the period
    const recentSessions = await AttendanceSession.find({
      team: match.team,
      date: { $gte: sinceStr },
    });
    const sessionIds = recentSessions.map((s) => s._id);

    // 3. Fetch records
    const recentRecords = await AttendanceRecord.find({
      session: { $in: sessionIds },
      team: match.team,
    });

    // 4. Calculate attendance and recommendation score for each player
    const recommendations = players.map((player) => {
      const pRecords = recentRecords.filter((r) => String(r.player) === String(player._id));
      const present = pRecords.filter((r) => r.status === 'PRESENT').length;
      const late = pRecords.filter((r) => r.status === 'LATE').length;
      const excused = pRecords.filter((r) => r.status === 'EXCUSED').length;
      const eligible = pRecords.length - excused;

      // Attendance percentage
      const attendancePct = eligible > 0 ? Math.round((present / eligible) * 100) : 0;

      // Position versatility factor: Kho-Kho requires balance between Chasers and Defenders
      let positionFactor = 10;
      if (player.position === 'Pole Diver' || player.position === 'All-Rounder') positionFactor = 15;
      else if (player.position === 'Defender') positionFactor = 12;

      // Composite score: 65% attendance pct + 20% volume + 15% position bonus
      const volumeBonus = Math.min(present * 2, 20);
      const compositeScore = Math.min(100, Math.round((attendancePct * 0.65) + volumeBonus + positionFactor));

      const isEligible = attendancePct >= (match.eligibilityMinAttendancePct || 75);

      // Human-readable ranking factor explanation
      let factorReason = '';
      if (attendancePct >= 90) {
        factorReason = `Outstanding attendance (${attendancePct}%, ${present}/${eligible} sessions) • Key ${player.position}`;
      } else if (attendancePct >= (match.eligibilityMinAttendancePct || 75)) {
        factorReason = `Consistent commitment (${attendancePct}%, ${present}/${eligible} sessions) • Reliable ${player.position}`;
      } else if (eligible === 0) {
        factorReason = `No recent session records available • Pending evaluation`;
      } else {
        factorReason = `Below ${match.eligibilityMinAttendancePct}% threshold (${attendancePct}%) • Requires coach exception`;
      }

      return {
        playerId: player._id,
        playerCode: player.playerId,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        photoUrl: player.photoUrl,
        active: player.active,
        attendancePercentage: attendancePct,
        sessionsPresent: present,
        sessionsEligible: eligible,
        totalSessionsTracked: pRecords.length,
        recommendationScore: compositeScore,
        rankingFactor: factorReason,
        isEligible,
      };
    });

    // Sort descending by recommendation score
    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Limit recommended squad by maxSquadSize
    const maxSquad = match.squadSize;
    const recommendedSquad = recommendations.slice(0, maxSquad);
    const recommendedReserves = recommendations.slice(maxSquad);

    return res.status(200).json({
      success: true,
      data: {
        matchId: match._id,
        team: match.team,
        maxSquadSize: match.squadSize,
        eligibilityThreshold: match.eligibilityMinAttendancePct,
        totalActiveCandidates: players.length,
        analysisPeriodDays: parseInt(days, 10),
        recommendedSquad,
        recommendedReserves,
        allRankings: recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveSquad = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && match.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot manage squad for another team.' });
    }

    const { selectedPlayers = [], reservePlayers = [], coachNotes = '' } = req.body;

    // Critical Constraint: Enforce squad size limit
    if (selectedPlayers.length > match.squadSize) {
      return res.status(400).json({
        success: false,
        message: `Squad limit exceeded: Selected ${selectedPlayers.length} players, but the allowed match squad limit is strictly ${match.squadSize} players.`,
      });
    }

    // Verify all players belong to this team
    const allPlayerIds = [
      ...selectedPlayers.map((p) => p.player || p._id || p.playerId),
      ...reservePlayers.map((p) => p.player || p._id || p.playerId),
    ];

    const dbPlayers = await Player.find({ _id: { $in: allPlayerIds }, team: match.team });
    if (dbPlayers.length !== allPlayerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: One or more players do not belong to the authorized team.',
      });
    }

    // Format selected players with validation
    const formattedSelected = selectedPlayers.map((p) => {
      const dbP = dbPlayers.find((dp) => String(dp._id) === String(p.player || p._id || p.playerId));
      return {
        player: dbP._id,
        jerseyNumber: dbP.jerseyNumber,
        name: dbP.name,
        position: dbP.position,
        roleInMatch: p.roleInMatch || 'Squad Member',
        attendancePercentage: Number(p.attendancePercentage || 0),
        attendanceSessionsPresent: Number(p.attendanceSessionsPresent || 0),
        attendanceSessionsTotal: Number(p.attendanceSessionsTotal || 0),
        recommendationScore: Number(p.recommendationScore || 0),
        rankingFactor: p.rankingFactor || '',
        exceptionApproved: !!p.exceptionApproved,
        exceptionReason: p.exceptionReason || '',
      };
    });

    const formattedReserves = reservePlayers.map((p) => {
      const dbP = dbPlayers.find((dp) => String(dp._id) === String(p.player || p._id || p.playerId));
      return {
        player: dbP._id,
        jerseyNumber: dbP.jerseyNumber,
        name: dbP.name,
        position: dbP.position,
        attendancePercentage: Number(p.attendancePercentage || 0),
        notes: p.notes || 'Standby reserve',
      };
    });

    let squad = await MatchSquad.findOne({ match: match._id });
    if (!squad) {
      squad = await MatchSquad.create({
        match: match._id,
        team: match.team,
        selectedPlayers: formattedSelected,
        reservePlayers: formattedReserves,
        maxSquadSize: match.squadSize,
        coachNotes,
        status: 'DRAFT',
      });
      match.squadRef = squad._id;
      await match.save();
    } else {
      squad.selectedPlayers = formattedSelected;
      squad.reservePlayers = formattedReserves;
      squad.coachNotes = coachNotes;
      squad.maxSquadSize = match.squadSize;
      await squad.save();
    }

    await logAuditEvent({
      actor: req.user,
      team: match.team,
      action: 'MATCH_SQUAD_SAVED',
      entity: 'SQUAD',
      entityId: squad._id.toString(),
      details: {
        matchId: match._id.toString(),
        opponent: match.opponent,
        selectedCount: formattedSelected.length,
        maxSquadSize: match.squadSize,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Draft match squad saved: ${formattedSelected.length} of ${match.squadSize} slots filled.`,
      data: squad,
    });
  } catch (error) {
    next(error);
  }
};

export const finalizeAndPublishSquad = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && match.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const squad = await MatchSquad.findOne({ match: match._id });
    if (!squad) {
      return res.status(400).json({
        success: false,
        message: 'No squad roster has been created for this match yet. Please select and save candidates first.',
      });
    }

    if (squad.selectedPlayers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot finalize an empty squad. Select at least 9 players (regulation Kho-Kho playing 9).',
      });
    }

    if (squad.selectedPlayers.length > match.squadSize) {
      return res.status(400).json({
        success: false,
        message: `Squad exceeds allowed limit of ${match.squadSize} players.`,
      });
    }

    // Check if any selected player is below eligibility threshold without an exception reason
    const unapprovedExceptions = squad.selectedPlayers.filter(
      (p) => p.attendancePercentage < match.eligibilityMinAttendancePct && (!p.exceptionApproved || !p.exceptionReason.trim())
    );

    if (unapprovedExceptions.length > 0) {
      const names = unapprovedExceptions.map((p) => `${p.name} (#${p.jerseyNumber})`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Coach Exception Required: The following players are below the ${match.eligibilityMinAttendancePct}% attendance threshold without an explicit approved reason: ${names}.`,
      });
    }

    const { publish = true } = req.body;

    squad.status = publish ? 'PUBLISHED' : 'FINALIZED';
    squad.finalizedBy = req.user._id;
    squad.finalizedAt = new Date();
    if (publish) squad.publishedAt = new Date();
    await squad.save();

    match.status = 'SQUAD_ANNOUNCED';
    await match.save();

    // Auto-create an official announcement for players
    if (publish) {
      const selectedNames = squad.selectedPlayers.map((p) => `#${p.jerseyNumber} ${p.name}`).join(', ');
      await Announcement.create({
        team: match.team,
        title: `Official Match Squad Announced: vs ${match.opponent}`,
        message: `The official match squad for the upcoming fixture against ${match.opponent} (${match.competition}) on ${new Date(match.matchDate).toLocaleDateString()} at ${match.venue} has been finalized.\n\nSelected Squad (${squad.selectedPlayers.length} players): ${selectedNames}\n\nAll selected players are requested to report for pre-match kit inspection and briefing.`,
        category: 'SQUAD',
        isUrgent: true,
        published: true,
        author: req.user._id,
        authorName: req.user.name || 'Head Coach',
      });
    }

    await logAuditEvent({
      actor: req.user,
      team: match.team,
      action: publish ? 'MATCH_SQUAD_PUBLISHED' : 'MATCH_SQUAD_FINALIZED',
      entity: 'SQUAD',
      entityId: squad._id.toString(),
      details: {
        matchId: match._id.toString(),
        opponent: match.opponent,
        squadCount: squad.selectedPlayers.length,
        published: publish,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Match squad officially ${publish ? 'finalized and published' : 'finalized'}.`,
      data: squad,
    });
  } catch (error) {
    next(error);
  }
};
