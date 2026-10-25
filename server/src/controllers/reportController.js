import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Player from '../models/Player.js';
import Match from '../models/Match.js';

/**
 * Standard Attendance Formula:
 * Present Percentage = (Present Sessions / Eligible Recorded Sessions) * 100
 * Policy: Excused sessions are excluded from the denominator.
 * Future or unrecorded sessions are never assumed to be absences.
 */

export const getOverviewStats = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Total active players
    const totalActivePlayers = await Player.countDocuments({ team, active: true });

    // 2. Today's attendance session(s)
    const todaySessions = await AttendanceSession.find({ team, date: todayStr });
    let presentToday = 0;
    let absentToday = 0;
    let lateToday = 0;
    let excusedToday = 0;
    let totalEligibleToday = 0;

    todaySessions.forEach((s) => {
      presentToday += s.totalPresent || 0;
      absentToday += s.totalAbsent || 0;
      lateToday += s.totalLate || 0;
      excusedToday += s.totalExcused || 0;
      totalEligibleToday += s.totalEligible || 0;
    });

    const eligibleToday = totalEligibleToday - excusedToday;
    const todayPercentage = eligibleToday > 0 ? Math.round((presentToday / eligibleToday) * 100) : 0;

    // 3. Weekly trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysStr = sevenDaysAgo.toISOString().slice(0, 10);

    const weeklySessions = await AttendanceSession.find({
      team,
      date: { $gte: sevenDaysStr, $lte: todayStr },
    }).sort({ date: 1 });

    const weeklyTrendMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      weeklyTrendMap[ds] = { date: ds, day: d.toLocaleDateString('en-US', { weekday: 'short' }), present: 0, absent: 0, total: 0 };
    }

    weeklySessions.forEach((s) => {
      if (weeklyTrendMap[s.date]) {
        weeklyTrendMap[s.date].present += s.totalPresent || 0;
        weeklyTrendMap[s.date].absent += s.totalAbsent || 0;
        weeklyTrendMap[s.date].total += (s.totalPresent || 0) + (s.totalAbsent || 0);
      }
    });

    const weeklyTrend = Object.values(weeklyTrendMap);

    // 4. Monthly attendance summary (current month)
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlySessions = await AttendanceSession.find({
      team,
      date: { $regex: `^${currentMonthPrefix}` },
    }).sort({ date: 1 });

    let monthPresent = 0;
    let monthAbsent = 0;
    let monthExcused = 0;
    let monthTotal = 0;

    monthlySessions.forEach((s) => {
      monthPresent += s.totalPresent || 0;
      monthAbsent += s.totalAbsent || 0;
      monthExcused += s.totalExcused || 0;
      monthTotal += s.totalEligible || 0;
    });

    const monthEligible = monthTotal - monthExcused;
    const monthlyPercentage = monthEligible > 0 ? Math.round((monthPresent / monthEligible) * 100) : 0;

    // 5. Upcoming Matches
    const upcomingMatches = await Match.find({
      team,
      matchDate: { $gte: new Date() },
    })
      .sort({ matchDate: 1 })
      .limit(5);

    // 6. Recent Sessions
    const recentSessions = await AttendanceSession.find({ team })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate('recordedBy', 'name');

    // 7. Team Members Match Attendance (100% Base, -2% Absent, -1% Excused)
    const activePlayers = await Player.find({ team, active: true }).sort({ jerseyNumber: 1 });
    const allTeamRecords = await AttendanceRecord.find({ team });

    let totalMatchPctSum = 0;
    let membersWithDeductions = 0;

    const memberMatchAttendance = activePlayers.map((player) => {
      const pRecords = allTeamRecords.filter((r) => String(r.player) === String(player._id));
      const present = pRecords.filter((r) => r.status === 'PRESENT').length;
      const late = pRecords.filter((r) => r.status === 'LATE').length;
      const absent = pRecords.filter((r) => r.status === 'ABSENT').length;
      const excused = pRecords.filter((r) => r.status === 'EXCUSED').length;

      const baseMatchPercentage = 100;
      const absentDeduction = absent * 2;
      const excusedDeduction = excused * 1;
      const totalDeduction = absentDeduction + excusedDeduction;
      const matchAttendancePercentage = Math.max(0, baseMatchPercentage - totalDeduction);

      totalMatchPctSum += matchAttendancePercentage;
      if (totalDeduction > 0) membersWithDeductions++;

      return {
        _id: player._id,
        playerId: player.playerId,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        totalSessions: pRecords.length,
        present,
        late,
        absent,
        excused,
        baseMatchPercentage,
        absentDeduction,
        excusedDeduction,
        totalDeduction,
        matchAttendancePercentage,
      };
    });

    const averageMatchAttendance = activePlayers.length > 0
      ? Math.round(totalMatchPctSum / activePlayers.length)
      : 75;

    return res.status(200).json({
      success: true,
      data: {
        team,
        totalActivePlayers,
        presentToday,
        absentToday,
        lateToday,
        excusedToday,
        todayPercentage,
        hasTodaySession: todaySessions.length > 0,
        weeklyTrend,
        monthlySummary: {
          sessionsCount: monthlySessions.length,
          present: monthPresent,
          absent: monthAbsent,
          percentage: monthlyPercentage,
        },
        teamMatchAttendance: {
          basePercentage: 75,
          averageMatchAttendance,
          membersWithDeductions,
          membersFullStanding: activePlayers.length - membersWithDeductions,
          members: memberMatchAttendance,
        },
        upcomingMatches,
        recentSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyReport = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const { sessionId } = req.query;

    let session = null;
    if (sessionId) {
      session = await AttendanceSession.findOne({ _id: sessionId, team });
    } else {
      session = await AttendanceSession.findOne({ team, date }).sort({ createdAt: -1 });
    }

    if (!session) {
      return res.status(200).json({
        success: true,
        data: {
          date,
          session: null,
          records: [],
          message: `No attendance session found for ${team} on ${date}.`,
        },
      });
    }

    const records = await AttendanceRecord.find({ session: session._id })
      .populate('player', 'name jerseyNumber position playerId active photoUrl')
      .sort({ 'player.jerseyNumber': 1 });

    return res.status(200).json({
      success: true,
      data: {
        date,
        session,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyReport = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const { startDate, endDate } = req.query;

    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      const today = new Date();
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay()); // Sunday
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6); // Saturday
      start = firstDay.toISOString().slice(0, 10);
      end = lastDay.toISOString().slice(0, 10);
    }

    const sessions = await AttendanceSession.find({
      team,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const sessionIds = sessions.map((s) => s._id);
    const records = await AttendanceRecord.find({
      session: { $in: sessionIds },
      team,
    }).populate('player', 'name jerseyNumber position playerId');

    const players = await Player.find({ team, active: true }).sort({ jerseyNumber: 1 });

    // Build player matrix
    const playerMatrix = players.map((player) => {
      const pRecords = records.filter((r) => r.player && String(r.player._id) === String(player._id));
      const presentCount = pRecords.filter((r) => r.status === 'PRESENT').length;
      const lateCount = pRecords.filter((r) => r.status === 'LATE').length;
      const excusedCount = pRecords.filter((r) => r.status === 'EXCUSED').length;
      const absentCount = pRecords.filter((r) => r.status === 'ABSENT').length;
      const eligible = pRecords.length - excusedCount;
      const absentDeduction = absentCount * 2;
      const excusedDeduction = excusedCount * 1;
      const totalDeduction = absentDeduction + excusedDeduction;
      const matchAttendancePercentage = Math.max(0, 75 - totalDeduction);

      const dailyBreakdown = {};
      sessions.forEach((s) => {
        const rec = pRecords.find((r) => String(r.session) === String(s._id));
        dailyBreakdown[s.date] = rec ? rec.status : 'UNRECORDED';
      });

      return {
        player: {
          _id: player._id,
          playerId: player.playerId,
          name: player.name,
          jerseyNumber: player.jerseyNumber,
          position: player.position,
        },
        presentCount,
        lateCount,
        excusedCount,
        absentCount,
        totalSessions: pRecords.length,
        percentage: pct,
        baseMatchPercentage: 75,
        absentDeduction,
        excusedDeduction,
        totalDeduction,
        matchAttendancePercentage,
        dailyBreakdown,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        sessions,
        playerMatrix,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);

    const monthStr = String(month).padStart(2, '0');
    const monthPrefix = `${year}-${monthStr}`;

    const sessions = await AttendanceSession.find({
      team,
      date: { $regex: `^${monthPrefix}` },
    }).sort({ date: 1 });

    const sessionIds = sessions.map((s) => s._id);
    const records = await AttendanceRecord.find({
      session: { $in: sessionIds },
      team,
    });

    const players = await Player.find({ team, active: true }).sort({ jerseyNumber: 1 });

    const playerStats = players.map((player) => {
      const pRecords = records.filter((r) => String(r.player) === String(player._id));
      const present = pRecords.filter((r) => r.status === 'PRESENT').length;
      const late = pRecords.filter((r) => r.status === 'LATE').length;
      const excused = pRecords.filter((r) => r.status === 'EXCUSED').length;
      const absent = pRecords.filter((r) => r.status === 'ABSENT').length;
      const eligible = pRecords.length - excused;
      const percentage = eligible > 0 ? Math.round((present / eligible) * 100) : 0;
      const absentDeduction = absent * 2;
      const excusedDeduction = excused * 1;
      const totalDeduction = absentDeduction + excusedDeduction;
      const matchAttendancePercentage = Math.max(0, 75 - totalDeduction);

      return {
        playerId: player.playerId,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
        position: player.position,
        present,
        late,
        excused,
        absent,
        totalSessions: pRecords.length,
        percentage,
        baseMatchPercentage: 75,
        absentDeduction,
        excusedDeduction,
        totalDeduction,
        matchAttendancePercentage,
      };
    });

    // Daily breakdown for monthly charts
    const dailyChart = sessions.map((s) => ({
      date: s.date.slice(8), // day of month
      fullDate: s.date,
      present: s.totalPresent,
      absent: s.totalAbsent,
      percentage: s.totalEligible - s.totalExcused > 0 ? Math.round((s.totalPresent / (s.totalEligible - s.totalExcused)) * 100) : 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        year,
        month,
        sessionsCount: sessions.length,
        playerStats,
        dailyChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomReport = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const { startDate, endDate, playerId, status, exportCsv } = req.query;

    const sessionFilter = { team };
    if (startDate && endDate) {
      sessionFilter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      sessionFilter.date = { $gte: startDate };
    } else if (endDate) {
      sessionFilter.date = { $lte: endDate };
    }

    const sessions = await AttendanceSession.find(sessionFilter).sort({ date: 1 });
    const sessionIds = sessions.map((s) => s._id);

    const recordFilter = { session: { $in: sessionIds }, team };
    if (playerId) recordFilter.player = playerId;
    if (status && status !== 'ALL') recordFilter.status = status;

    const records = await AttendanceRecord.find(recordFilter)
      .populate('player', 'name jerseyNumber position playerId')
      .populate('session', 'date sessionLabel')
      .sort({ date: -1 });

    if (exportCsv === 'true') {
      const headers = ['Date', 'Session', 'Player ID', 'Player Name', 'Jersey', 'Position', 'Status', 'Notes'];
      const rows = records.map((r) => [
        `"${r.session?.date || r.date}"`,
        `"${r.session?.sessionLabel || ''}"`,
        `"${r.player?.playerId || ''}"`,
        `"${r.player?.name || ''}"`,
        r.player?.jerseyNumber || '',
        `"${r.player?.position || ''}"`,
        r.status,
        `"${r.notes || ''}"`,
      ]);

      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${team.toLowerCase()}_attendance_report.csv"`);
      return res.status(200).send(csv);
    }

    return res.status(200).json({
      success: true,
      data: {
        totalRecords: records.length,
        sessionsCount: sessions.length,
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};
