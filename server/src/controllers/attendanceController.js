import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Player from '../models/Player.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getSessions = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const { startDate, endDate, status, page = 1, limit = 30 } = req.query;

    const filter = { team };
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AttendanceSession.countDocuments(filter);
    const sessions = await AttendanceSession.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('recordedBy', 'name username')
      .populate('updatedBy', 'name username');

    return res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionDetails = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('recordedBy', 'name username')
      .populate('updatedBy', 'name username');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    // Security check: Players or team admins can only view their own team
    if (req.user.role !== 'SUPER_ADMIN' && session.team !== req.user.team) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Cannot access attendance data for another team.',
      });
    }

    // Load active players for this team to ensure all players are accounted for
    const activePlayers = await Player.find({ team: session.team, active: true }).sort({ jerseyNumber: 1 });

    // Load recorded records
    const records = await AttendanceRecord.find({ session: session._id })
      .populate('player', 'name jerseyNumber position playerId active photoUrl')
      .populate('recordedBy', 'name username')
      .populate('updatedBy', 'name username');

    const recordMap = new Map();
    records.forEach((r) => {
      if (r.player && r.player._id) {
        recordMap.set(r.player._id.toString(), r);
      }
    });

    // Merge to return all active players with their recorded status or null if not yet marked
    const playerRows = activePlayers.map((player) => {
      const record = recordMap.get(player._id.toString());
      return {
        player: {
          _id: player._id,
          playerId: player.playerId,
          name: player.name,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
          active: player.active,
          photoUrl: player.photoUrl,
        },
        recordId: record ? record._id : null,
        status: record ? record.status : 'PRESENT', // default to present in UI
        isRecorded: !!record,
        notes: record ? record.notes : '',
        updatedAt: record ? record.updatedAt : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        session,
        players: playerRows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const team = req.targetTeam;
    const { date, sessionLabel, notes = '' } = req.body;

    if (!date || !sessionLabel) {
      return res.status(400).json({
        success: false,
        message: 'Date (YYYY-MM-DD) and Session Label are required.',
      });
    }

    // Check if session already exists for this team, date, and label
    const existing = await AttendanceSession.findOne({
      team,
      date,
      sessionLabel: sessionLabel.trim(),
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Existing session loaded.',
        data: existing,
        isExisting: true,
      });
    }

    const session = await AttendanceSession.create({
      team,
      date,
      sessionLabel: sessionLabel.trim(),
      notes,
      recordedBy: req.user._id,
      status: 'DRAFT',
    });

    await logAuditEvent({
      actor: req.user,
      team,
      action: 'ATTENDANCE_SESSION_CREATED',
      entity: 'ATTENDANCE',
      entityId: session._id.toString(),
      details: { date: session.date, sessionLabel: session.sessionLabel },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance session created.',
      data: session,
      isExisting: false,
    });
  } catch (error) {
    next(error);
  }
};

export const saveBatchAttendance = async (req, res, next) => {
  try {
    const { sessionId, records, finalize = false, confirmEditFinalized = false } = req.body;

    if (!sessionId || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and a non-empty records array are required.',
      });
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    // Enforce team access
    if (req.user.role !== 'SUPER_ADMIN' && session.team !== req.user.team) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Cannot record attendance for players of another team.',
      });
    }

    // If session is already finalized, require explicit confirmation
    const wasAlreadyFinalized = session.status === 'FINALIZED';
    if (wasAlreadyFinalized && !confirmEditFinalized) {
      return res.status(400).json({
        success: false,
        isFinalized: true,
        message: 'This session has already been finalized. Please confirm you wish to edit a finalized attendance session.',
      });
    }

    // Validate that all referenced players belong to this team
    const playerIds = records.map((r) => r.playerId);
    const validPlayers = await Player.find({ _id: { $in: playerIds }, team: session.team });
    if (validPlayers.length !== playerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more players do not belong to the authorized team for this session.',
      });
    }

    // Bulk upsert records
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    const bulkOps = records.map((r) => {
      const validStatus = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(r.status) ? r.status : 'PRESENT';
      if (validStatus === 'PRESENT') presentCount++;
      else if (validStatus === 'ABSENT') absentCount++;
      else if (validStatus === 'LATE') lateCount++;
      else if (validStatus === 'EXCUSED') excusedCount++;

      return {
        updateOne: {
          filter: { session: session._id, player: r.playerId },
          update: {
            $set: {
              team: session.team,
              date: session.date,
              status: validStatus,
              notes: r.notes || '',
              updatedBy: req.user._id,
            },
            $setOnInsert: {
              recordedBy: req.user._id,
            },
          },
          upsert: true,
        },
      };
    });

    await AttendanceRecord.bulkWrite(bulkOps);

    // Update session summary statistics
    session.totalEligible = records.length;
    session.totalPresent = presentCount;
    session.totalAbsent = absentCount;
    session.totalLate = lateCount;
    session.totalExcused = excusedCount;
    session.updatedBy = req.user._id;

    if (finalize) {
      session.status = 'FINALIZED';
      session.finalizedAt = new Date();
    }
    await session.save();

    await logAuditEvent({
      actor: req.user,
      team: session.team,
      action: wasAlreadyFinalized ? 'FINALIZED_ATTENDANCE_EDITED' : (finalize ? 'ATTENDANCE_FINALIZED' : 'ATTENDANCE_SAVED'),
      entity: 'ATTENDANCE',
      entityId: session._id.toString(),
      details: {
        date: session.date,
        sessionLabel: session.sessionLabel,
        totalEligible: records.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        finalized: session.status === 'FINALIZED',
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Attendance for ${records.length} players ${session.status === 'FINALIZED' ? 'finalized' : 'saved'} successfully.`,
      data: {
        sessionId: session._id,
        status: session.status,
        summary: {
          totalEligible: records.length,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendancePercentage: records.length - excusedCount > 0
            ? Math.round((presentCount / (records.length - excusedCount)) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const finalizeSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && session.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    session.status = 'FINALIZED';
    session.finalizedAt = new Date();
    session.updatedBy = req.user._id;
    await session.save();

    await logAuditEvent({
      actor: req.user,
      team: session.team,
      action: 'ATTENDANCE_SESSION_FINALIZED',
      entity: 'ATTENDANCE',
      entityId: session._id.toString(),
      details: { date: session.date, sessionLabel: session.sessionLabel },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance session finalized successfully.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlayerAttendance = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found.' });
    }

    // Players can only view their own attendance
    if (req.user.role === 'PLAYER' && String(req.user.playerRef) !== String(player._id)) {
      return res.status(403).json({ success: false, message: 'Access denied: Players can only view their own attendance.' });
    }

    // Admins can only view their team
    if (req.user.role !== 'SUPER_ADMIN' && player.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cross-team access.' });
    }

    const records = await AttendanceRecord.find({ player: player._id })
      .populate('session', 'sessionLabel date status')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const excused = records.filter((r) => r.status === 'EXCUSED').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;

    const eligible = total - excused;
    const percentage = eligible > 0 ? Math.round((present / eligible) * 100) : 0;

    // Official Match Attendance Policy:
    // Base match attendance for team members is 75%.
    // If absent: automatically reduce 2% per session.
    // If excused: automatically reduce 1% per session.
    const baseMatchPercentage = 75;
    const absentDeduction = absent * 2;
    const excusedDeduction = excused * 1;
    const totalDeduction = absentDeduction + excusedDeduction;
    const matchAttendancePercentage = Math.max(0, baseMatchPercentage - totalDeduction);

    return res.status(200).json({
      success: true,
      data: {
        player: {
          id: player._id,
          name: player.name,
          jerseyNumber: player.jerseyNumber,
          team: player.team,
          position: player.position,
        },
        summary: {
          totalSessions: total,
          eligibleSessions: eligible,
          present,
          late,
          excused,
          absent,
          percentage,
          baseMatchPercentage,
          absentDeduction,
          excusedDeduction,
          totalDeduction,
          matchAttendancePercentage,
        },
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};
