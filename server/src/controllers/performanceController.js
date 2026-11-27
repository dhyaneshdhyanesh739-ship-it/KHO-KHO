import PlayerPerformance from '../models/PlayerPerformance.js';
import TeamPerformance from '../models/TeamPerformance.js';
import { initialPlayerPerformance, initialTeamPerformance } from '../data/khoKhoInitialData.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { findOfficialPlayer } from '../config/roster.js';

let fallbackPlayerPerf = [...initialPlayerPerformance];
let fallbackTeamPerf = [...initialTeamPerformance];

export const getPlayersPerformance = async (req, res, next) => {
  try {
    const { team, position, search, sortBy = 'jerseyNumber', sortOrder = 'asc' } = req.query;
    let players;

    try {
      const filter = {};
      if (team && team !== 'ALL') filter.team = team;
      if (position && position !== 'ALL') filter.position = position;
      if (search && search.trim()) {
        filter.$or = [
          { name: new RegExp(search.trim(), 'i') },
          { playerId: new RegExp(search.trim(), 'i') },
        ];
      }
      players = await PlayerPerformance.find(filter);
      
      // Strict Filter: Retain only verified roster athletes
      if (Array.isArray(players) && players.length > 0) {
        players = players.filter((p) => findOfficialPlayer(p.playerId) || findOfficialPlayer(p.name));
      }
    } catch (e) {
      players = fallbackPlayerPerf;
    }

    if (!players || players.length === 0) {
      players = [...fallbackPlayerPerf];
    }

    // Filter in-memory
    if (team && team !== 'ALL') {
      players = players.filter((p) => p.team?.toUpperCase() === team.toUpperCase());
    }
    if (position && position !== 'ALL') {
      players = players.filter((p) => p.position?.toLowerCase().includes(position.toLowerCase()));
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      players = players.filter((p) =>
        p.name?.toLowerCase().includes(s) ||
        p.playerId?.toLowerCase().includes(s) ||
        String(p.jerseyNumber) === s
      );
    }

    // Sort strictly by jersey number ascending (or specified attribute)
    players.sort((a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;
      if (sortBy === 'jerseyNumber') {
        valA = Number(valA);
        valB = Number(valB);
      }
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return res.status(200).json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlayerPerformanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let player;
    try {
      player = await PlayerPerformance.findById(id);
    } catch (e) {}

    if (!player) {
      player = fallbackPlayerPerf.find((p) => p.id === id || p.playerId === id);
    }

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player performance record not found' });
    }

    return res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

export const createPlayerPerformance = async (req, res, next) => {
  try {
    const {
      playerId,
      name,
      jerseyNumber,
      team,
      position,
      photoUrl,
      matchesPlayed,
      matchesParticipated,
      defendersEliminated,
      successfulDefenses,
      defenseTimeSec,
      diveSuccessPct,
      turnAccuracyPct,
      rating,
      form,
      recentMatchStats,
    } = req.body;

    if (!name || !jerseyNumber) {
      return res.status(400).json({ success: false, message: 'Name and Jersey Number are required' });
    }

    const newRecord = {
      id: `perf-${Date.now()}`,
      playerId: playerId || `P${jerseyNumber}`,
      name: name.trim(),
      jerseyNumber: Number(jerseyNumber),
      team: team || 'BOYS',
      position: position || 'All-Rounder',
      photoUrl: photoUrl?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      matchesPlayed: Number(matchesPlayed) || 0,
      matchesParticipated: Number(matchesParticipated) || 0,
      defendersEliminated: Number(defendersEliminated) || 0,
      successfulDefenses: Number(successfulDefenses) || 0,
      defenseTimeSec: Number(defenseTimeSec) || 0,
      diveSuccessPct: Number(diveSuccessPct) || 85.0,
      turnAccuracyPct: Number(turnAccuracyPct) || 85.0,
      rating: Number(rating) || 8.5,
      form: Array.isArray(form) ? form : ['W', 'W', 'W'],
      recentMatchStats: Array.isArray(recentMatchStats) ? recentMatchStats : [],
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await PlayerPerformance.create(newRecord);
    } catch (e) {}

    fallbackPlayerPerf.unshift(newRecord);

    return res.status(201).json({ success: true, data: newRecord, message: 'Player performance record created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updatePlayerPerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updated;
    try {
      updated = await PlayerPerformance.findByIdAndUpdate(id, updates, { new: true });
    } catch (e) {}

    const index = fallbackPlayerPerf.findIndex((p) => p.id === id || p.playerId === id);
    if (index !== -1) {
      fallbackPlayerPerf[index] = { ...fallbackPlayerPerf[index], ...updates };
      updated = fallbackPlayerPerf[index];
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Player performance record not found' });
    }

    return res.status(200).json({ success: true, data: updated, message: 'Player performance updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePlayerPerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await PlayerPerformance.findByIdAndDelete(id);
    } catch (e) {}

    fallbackPlayerPerf = fallbackPlayerPerf.filter((p) => p.id !== id && p.playerId !== id);

    return res.status(200).json({ success: true, message: 'Player performance record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTeamPerformance = async (req, res, next) => {
  try {
    let teams;
    try {
      teams = await TeamPerformance.find({});
    } catch (e) {
      teams = fallbackTeamPerf;
    }

    if (!teams || teams.length === 0) {
      teams = fallbackTeamPerf;
    }

    // Top performers summary for boys and girls
    const boysTop = fallbackPlayerPerf.filter((p) => p.team === 'BOYS').sort((a, b) => b.rating - a.rating).slice(0, 3);
    const girlsTop = fallbackPlayerPerf.filter((p) => p.team === 'GIRLS').sort((a, b) => b.rating - a.rating).slice(0, 3);

    return res.status(200).json({
      success: true,
      data: {
        teams,
        rankings: [
          { rank: 1, teamName: "Boys Squad", division: "BOYS", played: 32, won: 28, winPct: "87.5%", points: 1420 },
          { rank: 1, teamName: "Girls Squad", division: "GIRLS", played: 28, won: 25, winPct: "89.3%", points: 1260 },
          { rank: 2, teamName: "Tamil Nadu Titans", division: "STATE", played: 30, won: 24, winPct: "80.0%", points: 1210 },
          { rank: 3, teamName: "Western Warriors", division: "NATIONAL", played: 26, won: 20, winPct: "76.9%", points: 1090 },
        ],
        spotlights: {
          boysTop,
          girlsTop,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeamPerformance = async (req, res, next) => {
  try {
    const { team } = req.params;
    const updates = req.body;

    const index = fallbackTeamPerf.findIndex((t) => t.team.toUpperCase() === team.toUpperCase());
    if (index !== -1) {
      fallbackTeamPerf[index] = { ...fallbackTeamPerf[index], ...updates };
    }

    try {
      await TeamPerformance.findByIdAndUpdate(team, updates);
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Team performance updated successfully' });
  } catch (error) {
    next(error);
  }
};
