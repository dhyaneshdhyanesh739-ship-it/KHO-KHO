import Player from '../models/Player.js';
import User from '../models/User.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import MatchSquad from '../models/MatchSquad.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getPlayers = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const { search, position, status, sortBy = 'jerseyNumber', sortOrder = 'asc', page = 1, limit = 50 } = req.query;

    const filter = { team };

    if (status === 'active') {
      filter.active = true;
    } else if (status === 'inactive') {
      filter.active = false;
    }

    if (position && position !== 'ALL') {
      filter.position = position;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { playerId: regex }];
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Player.countDocuments(filter);
    const players = await Player.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('userRef', 'username lastLogin');

    return res.status(200).json({
      success: true,
      data: players,
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

export const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id).populate('userRef', 'username lastLogin isActive');
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // Ownership check: ensure the player belongs to the requester's team unless requester is SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN' && player.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access to player of another team' });
    }

    // Calculate historical attendance stats
    const records = await AttendanceRecord.find({ player: player._id });
    const totalRecorded = records.length;
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;

    // Configurable standard policy: Excused sessions excluded from denominator; Late counts as 0.5 or present (we track both)
    const eligibleSessions = totalRecorded - excusedCount;
    const attendancePct = eligibleSessions > 0 ? Math.round((presentCount / eligibleSessions) * 100) : 100;

    // Official Match Attendance Policy:
    // Base attendance for match: 100%
    // Absent: reduce 2% per session
    // Excused: reduce 1% per session
    const baseMatchPercentage = 100;
    const absentDeduction = absentCount * 2;
    const excusedDeduction = excusedCount * 1;
    const totalDeduction = absentDeduction + excusedDeduction;
    const matchAttendancePercentage = Math.max(0, baseMatchPercentage - totalDeduction);

    return res.status(200).json({
      success: true,
      data: {
        ...player.toJSON(),
        stats: {
          totalRecorded,
          presentCount,
          lateCount,
          excusedCount,
          absentCount,
          eligibleSessions,
          attendancePercentage: attendancePct,
          baseMatchPercentage,
          absentDeduction,
          excusedDeduction,
          totalDeduction,
          matchAttendancePercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPlayer = async (req, res, next) => {
  try {
    const team = (req.targetTeam && req.targetTeam !== 'ALL') ? req.targetTeam : (req.body.team || 'BOYS');
    const {
      playerId,
      name,
      jerseyNumber,
      position = 'All-Rounder',
      contactInfo = {},
      dateOfBirth,
      bloodGroup = 'Unknown',
      heightCm,
      weightKg,
      notes = '',
      createLogin = true,
      customUsername,
      customPassword,
    } = req.body;

    if (!playerId || !name || !jerseyNumber) {
      return res.status(400).json({
        success: false,
        message: 'Player ID, Name, and Jersey Number are required.',
      });
    }

    // Check unique playerId
    const existingId = await Player.findOne({ playerId: playerId.trim().toUpperCase() });
    if (existingId) {
      return res.status(409).json({
        success: false,
        message: `Player ID '${playerId}' is already taken. Please assign a distinct ID.`,
      });
    }

    // Check unique jersey in this team
    const existingJersey = await Player.findOne({ team, jerseyNumber: Number(jerseyNumber) });
    if (existingJersey) {
      return res.status(409).json({
        success: false,
        message: `Jersey #${jerseyNumber} is already taken in the ${team} team by ${existingJersey.name}.`,
      });
    }

    let userAccount = null;
    if (createLogin) {
      // Username defaults to playerId in lowercase (e.g. b01 or custom)
      const username = (customUsername || playerId).trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `Username '${username}' is already in use. Please specify a different login username.`,
        });
      }

      const rawPassword = customPassword || `${username}@KhoKho2026`;
      const passwordHash = await User.hashPassword(rawPassword);

      userAccount = await User.create({
        username,
        passwordHash,
        name,
        email: contactInfo.email || '',
        role: 'PLAYER',
        team,
        isActive: true,
      });
    }

    const newPlayer = await Player.create({
      playerId: playerId.trim().toUpperCase(),
      name: name.trim(),
      team,
      jerseyNumber: Number(jerseyNumber),
      position,
      contactInfo,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      bloodGroup,
      heightCm: heightCm ? Number(heightCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      notes,
      userRef: userAccount ? userAccount._id : null,
      active: true,
    });

    if (userAccount) {
      userAccount.playerRef = newPlayer._id;
      await userAccount.save();
    }

    await logAuditEvent({
      actor: req.user,
      team,
      action: 'PLAYER_CREATED',
      entity: 'PLAYER',
      entityId: newPlayer._id.toString(),
      details: { playerId: newPlayer.playerId, name: newPlayer.name, jerseyNumber: newPlayer.jerseyNumber },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: `Player ${newPlayer.name} (#${newPlayer.jerseyNumber}) added successfully.`,
      data: newPlayer,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && player.team !== req.user.team) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Cannot modify players outside your authorized team.',
      });
    }

    const {
      name,
      jerseyNumber,
      position,
      contactInfo,
      dateOfBirth,
      bloodGroup,
      heightCm,
      weightKg,
      notes,
      active,
    } = req.body;

    // Check jersey collision if jersey number is being changed
    if (jerseyNumber && Number(jerseyNumber) !== player.jerseyNumber) {
      const existing = await Player.findOne({
        team: player.team,
        jerseyNumber: Number(jerseyNumber),
        _id: { $ne: player._id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Jersey #${jerseyNumber} is already assigned to ${existing.name}.`,
        });
      }
      player.jerseyNumber = Number(jerseyNumber);
    }

    if (name) player.name = name.trim();
    if (position) player.position = position;
    if (contactInfo) player.contactInfo = { ...player.contactInfo, ...contactInfo };
    if (dateOfBirth !== undefined) player.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (bloodGroup) player.bloodGroup = bloodGroup;
    if (heightCm !== undefined) player.heightCm = heightCm ? Number(heightCm) : null;
    if (weightKg !== undefined) player.weightKg = weightKg ? Number(weightKg) : null;
    if (notes !== undefined) player.notes = notes;
    if (typeof active === 'boolean') player.active = active;

    await player.save();

    await logAuditEvent({
      actor: req.user,
      team: player.team,
      action: 'PLAYER_UPDATED',
      entity: 'PLAYER',
      entityId: player._id.toString(),
      details: { playerId: player.playerId, name: player.name },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Player profile updated successfully.',
      data: player,
    });
  } catch (error) {
    next(error);
  }
};

export const togglePlayerStatus = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && player.team !== req.user.team) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Cannot toggle player status outside your authorized team.',
      });
    }

    player.active = !player.active;
    await player.save();

    // Also update associated user account if one exists
    if (player.userRef) {
      await User.findByIdAndUpdate(player.userRef, { isActive: player.active });
    }

    await logAuditEvent({
      actor: req.user,
      team: player.team,
      action: player.active ? 'PLAYER_ACTIVATED' : 'PLAYER_DEACTIVATED',
      entity: 'PLAYER',
      entityId: player._id.toString(),
      details: { playerId: player.playerId, name: player.name, active: player.active },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Player ${player.name} is now ${player.active ? 'Active' : 'Inactive'}.`,
      data: player,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }

    // Security check: Players or team admins can only access their own team
    if (req.user.role !== 'SUPER_ADMIN' && player.team !== req.user.team) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Cannot remove a team member outside your authorized team.',
      });
    }

    // Clean up associated user login account if any exists
    if (player.userRef) {
      await User.findByIdAndDelete(player.userRef);
    }

    // Clean up associated attendance records
    await AttendanceRecord.deleteMany({ player: player._id });

    // Clean up references in MatchSquad rosters
    await MatchSquad.updateMany(
      { team: player.team },
      {
        $pull: {
          selectedPlayers: { player: player._id },
          reservePlayers: { player: player._id },
        },
      }
    );

    await Player.findByIdAndDelete(player._id);

    await logAuditEvent({
      actor: req.user,
      team: player.team,
      action: 'PLAYER_REMOVED',
      entity: 'PLAYER',
      entityId: player._id.toString(),
      details: {
        name: player.name,
        playerId: player.playerId,
        jerseyNumber: player.jerseyNumber,
        team: player.team,
      },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Team member ${player.name} (#${player.jerseyNumber}, ${player.playerId}) was successfully removed from the ${player.team} roster.`,
    });
  } catch (error) {
    next(error);
  }
};

export const exportPlayersCSV = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'BOYS') : req.targetTeam;
    const players = await Player.find({ team }).sort({ jerseyNumber: 1 });

    const headers = ['Player ID', 'Name', 'Team', 'Jersey Number', 'Position', 'Status', 'Phone', 'Email', 'Blood Group'];
    const rows = players.map((p) => [
      `"${p.playerId}"`,
      `"${p.name}"`,
      `"${p.team}"`,
      p.jerseyNumber,
      `"${p.position}"`,
      p.active ? 'Active' : 'Inactive',
      `"${p.contactInfo?.phone || ''}"`,
      `"${p.contactInfo?.email || ''}"`,
      `"${p.bloodGroup || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${team.toLowerCase()}_kho_kho_roster.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const importPlayersCSV = async (req, res, next) => {
  try {
    const team = req.targetTeam;
    const { csvData } = req.body;

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'CSV data string is required in the request body.',
      });
    }

    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'CSV file contains no data rows.',
      });
    }

    const inserted = [];
    const errors = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple regex split for CSV fields handling quotes
      const values = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
      const [playerId, name, , jerseyStr, position, , phone, email, bloodGroup] = values;

      if (!playerId || !name || !jerseyStr) {
        errors.push({ row: i + 1, error: 'Missing required fields (Player ID, Name, or Jersey)' });
        continue;
      }

      const jerseyNumber = parseInt(jerseyStr, 10);
      if (isNaN(jerseyNumber)) {
        errors.push({ row: i + 1, error: `Invalid jersey number: ${jerseyStr}` });
        continue;
      }

      // Check conflicts
      const existingId = await Player.findOne({ playerId: playerId.toUpperCase() });
      if (existingId) {
        errors.push({ row: i + 1, error: `Player ID '${playerId}' already exists` });
        continue;
      }

      const existingJersey = await Player.findOne({ team, jerseyNumber });
      if (existingJersey) {
        errors.push({ row: i + 1, error: `Jersey #${jerseyNumber} already assigned in ${team} team` });
        continue;
      }

      const validPosition = ['Chaser', 'Defender', 'All-Rounder', 'Pole Diver', 'Running Chaser'].includes(position)
        ? position
        : 'All-Rounder';

      const player = await Player.create({
        playerId: playerId.toUpperCase(),
        name,
        team,
        jerseyNumber,
        position: validPosition,
        contactInfo: { phone: phone || '', email: email || '' },
        bloodGroup: bloodGroup || 'Unknown',
        active: true,
      });

      inserted.push(player);
    }

    await logAuditEvent({
      actor: req.user,
      team,
      action: 'ROSTER_CSV_IMPORTED',
      entity: 'PLAYER',
      details: { insertedCount: inserted.length, errorCount: errors.length },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `CSV imported: ${inserted.length} players added, ${errors.length} skipped.`,
      insertedCount: inserted.length,
      errors,
    });
  } catch (error) {
    next(error);
  }
};
