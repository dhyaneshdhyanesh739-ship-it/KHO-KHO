import GroundActivity from '../models/GroundActivity.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Player from '../models/Player.js';
import { logAuditEvent } from '../utils/auditLogger.js';

/**
 * Create a new Daily Ground Activity (Admin / Super Admin)
 */
export const createGroundActivity = async (req, res, next) => {
  try {
    const {
      team,
      date,
      title,
      focusArea,
      activities,
      coachNotes,
      sessionTime,
      intensity,
    } = req.body;

    if (!date || !title) {
      return res.status(400).json({
        success: false,
        message: 'Date and Title are required.',
      });
    }

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one activity or drill must be added.',
      });
    }

    // Determine target team: Admin can set BOYS, GIRLS, or BOTH
    let targetTeam = team;
    if (req.user.role !== 'SUPER_ADMIN') {
      // If team admin, limit to their team or BOTH if coaching admin
      if (req.user.role === 'BOYS_ADMIN' && team !== 'BOYS' && team !== 'BOTH') {
        targetTeam = 'BOYS';
      } else if (req.user.role === 'GIRLS_ADMIN' && team !== 'GIRLS' && team !== 'BOTH') {
        targetTeam = 'GIRLS';
      }
    }

    const groundActivity = await GroundActivity.create({
      team: targetTeam || req.user.team || 'BOTH',
      date,
      title: title.trim(),
      focusArea: focusArea ? focusArea.trim() : 'General Ground Training',
      activities: activities.map((a) => (typeof a === 'string' ? a.trim() : '')).filter(Boolean),
      coachNotes: coachNotes ? coachNotes.trim() : '',
      sessionTime: sessionTime || 'MORNING',
      intensity: intensity || 'HIGH',
      createdBy: req.user._id,
      createdByName: req.user.name || 'Coaching Staff',
    });

    await logAuditEvent({
      actor: req.user,
      team: groundActivity.team,
      action: 'GROUND_ACTIVITY_CREATED',
      entity: 'ATTENDANCE',
      entityId: groundActivity._id.toString(),
      details: { title: groundActivity.title, date: groundActivity.date, team: groundActivity.team },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Daily ground activity published successfully.',
      data: groundActivity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Daily Ground Activities (Admin / Super Admin)
 */
export const getAdminGroundActivities = async (req, res, next) => {
  try {
    const { team, startDate, endDate } = req.query;
    const filter = {};

    if (req.user.role === 'SUPER_ADMIN') {
      if (team && team !== 'ALL') {
        filter.$or = [{ team }, { team: 'BOTH' }];
      }
    } else {
      const adminTeam = req.user.team || 'BOYS';
      filter.$or = [{ team: adminTeam }, { team: 'BOTH' }];
    }

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    }

    const activities = await GroundActivity.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate('createdBy', 'name username');

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Daily Ground Activities for a Team Member / Player
 * Strictly filtered by attendance: ONLY returned for dates where the player was marked PRESENT or LATE.
 * ABSENT and EXCUSED dates are excluded!
 */
export const getPlayerGroundActivities = async (req, res, next) => {
  try {
    const playerRef = req.user.playerRef;
    if (!playerRef) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No player profile associated with this account.',
      });
    }

    const player = await Player.findById(playerRef);
    if (!player) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // 1. Fetch all attendance records where status is PRESENT or LATE
    const attendanceRecords = await AttendanceRecord.find({
      player: player._id,
      status: { $in: ['PRESENT', 'LATE'] },
    }).select('date status notes');

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        summary: {
          attendedDaysCount: 0,
          info: 'No attended ground sessions found. Ground activities are only visible for sessions you attended (Present or Late).',
        },
      });
    }

    // Map attended dates to their status
    const attendedDateMap = new Map();
    attendanceRecords.forEach((rec) => {
      attendedDateMap.set(rec.date, rec.status);
    });

    const attendedDates = Array.from(attendedDateMap.keys());

    // 2. Fetch ground activities for player's team matching attended dates
    const activities = await GroundActivity.find({
      team: { $in: [player.team, 'BOTH'] },
      date: { $in: attendedDates },
    }).sort({ date: -1, createdAt: -1 });

    // 3. Attach the player's attendance status to each activity for display
    const enrichedActivities = activities.map((act) => {
      const obj = act.toObject();
      obj.playerAttendanceStatus = attendedDateMap.get(act.date) || 'PRESENT';
      return obj;
    });

    return res.status(200).json({
      success: true,
      data: enrichedActivities,
      summary: {
        attendedDaysCount: attendedDates.length,
        unlockedActivitiesCount: enrichedActivities.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a Daily Ground Activity (Admin / Super Admin)
 */
export const updateGroundActivity = async (req, res, next) => {
  try {
    const activity = await GroundActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Ground activity not found.' });
    }

    if (
      req.user.role !== 'SUPER_ADMIN' &&
      activity.team !== req.user.team &&
      activity.team !== 'BOTH'
    ) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const { title, focusArea, activities, coachNotes, sessionTime, intensity, team, date } = req.body;
    if (title) activity.title = title.trim();
    if (date) activity.date = date;
    if (focusArea) activity.focusArea = focusArea.trim();
    if (Array.isArray(activities) && activities.length > 0) {
      activity.activities = activities.map((a) => (typeof a === 'string' ? a.trim() : '')).filter(Boolean);
    }
    if (coachNotes !== undefined) activity.coachNotes = coachNotes.trim();
    if (sessionTime) activity.sessionTime = sessionTime;
    if (intensity) activity.intensity = intensity;
    if (team) activity.team = team;

    await activity.save();

    await logAuditEvent({
      actor: req.user,
      team: activity.team,
      action: 'GROUND_ACTIVITY_UPDATED',
      entity: 'ATTENDANCE',
      entityId: activity._id.toString(),
      details: { title: activity.title, date: activity.date },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Ground activity updated successfully.',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Daily Ground Activity (Admin / Super Admin)
 */
export const deleteGroundActivity = async (req, res, next) => {
  try {
    const activity = await GroundActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Ground activity not found.' });
    }

    if (
      req.user.role !== 'SUPER_ADMIN' &&
      activity.team !== req.user.team &&
      activity.team !== 'BOTH'
    ) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await activity.deleteOne();

    await logAuditEvent({
      actor: req.user,
      team: activity.team,
      action: 'GROUND_ACTIVITY_DELETED',
      entity: 'ATTENDANCE',
      entityId: activity._id.toString(),
      details: { title: activity.title, date: activity.date },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Ground activity deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
