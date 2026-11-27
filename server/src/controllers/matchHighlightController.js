import MatchHighlight from '../models/MatchHighlight.js';
import { initialMatchHighlights } from '../data/khoKhoInitialData.js';
import { logAuditEvent } from '../utils/auditLogger.js';

let fallbackHighlights = [...initialMatchHighlights];

export const getMatchHighlights = async (req, res, next) => {
  try {
    const { division, tournament, player, search } = req.query;
    let highlights;

    try {
      const filter = {};
      if (division && division !== 'ALL') filter.division = division;
      if (tournament && tournament !== 'ALL') filter.tournament = tournament;
      if (search && search.trim()) {
        filter.$or = [
          { title: new RegExp(search.trim(), 'i') },
          { description: new RegExp(search.trim(), 'i') },
          { venue: new RegExp(search.trim(), 'i') },
        ];
      }
      highlights = await MatchHighlight.find(filter).sort({ matchDate: -1, createdAt: -1 });
    } catch (e) {
      highlights = fallbackHighlights;
    }

    if (!highlights || highlights.length === 0) {
      highlights = fallbackHighlights;
    }

    if (division && division !== 'ALL') {
      highlights = highlights.filter((h) => h.division?.toUpperCase() === division.toUpperCase());
    }
    if (tournament && tournament !== 'ALL') {
      highlights = highlights.filter((h) => h.tournament?.toLowerCase().includes(tournament.toLowerCase()));
    }
    if (player && player.trim()) {
      const p = player.trim().toLowerCase();
      highlights = highlights.filter((h) =>
        h.mvpPlayer?.toLowerCase().includes(p) ||
        (Array.isArray(h.featuredPlayers) && h.featuredPlayers.some((fp) => fp.toLowerCase().includes(p)))
      );
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      highlights = highlights.filter((h) =>
        h.title?.toLowerCase().includes(s) ||
        h.description?.toLowerCase().includes(s) ||
        h.venue?.toLowerCase().includes(s) ||
        h.team1?.toLowerCase().includes(s) ||
        h.team2?.toLowerCase().includes(s)
      );
    }

    return res.status(200).json({
      success: true,
      count: highlights.length,
      data: highlights,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchHighlightById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let match;
    try {
      match = await MatchHighlight.findById(id);
    } catch (e) {}

    if (!match) {
      match = fallbackHighlights.find((h) => h.id === id);
    }

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match highlight not found' });
    }

    return res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

export const createMatchHighlight = async (req, res, next) => {
  try {
    const {
      title,
      description,
      tournament,
      team1,
      team2,
      score1,
      score2,
      division,
      matchDate,
      venue,
      videoUrl,
      thumbnailUrl,
      duration,
      mvpPlayer,
      featuredPlayers,
      keyMoments,
    } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Title and video URL are required' });
    }

    const newHighlight = {
      id: `match-hl-${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      tournament: tournament || 'National Championship',
      team1: team1 || 'Boys Squad',
      team2: team2 || 'Opponent Team',
      score1: Number(score1) || 0,
      score2: Number(score2) || 0,
      division: division || 'BOYS',
      matchDate: matchDate ? new Date(matchDate).toISOString() : new Date().toISOString(),
      venue: venue || 'National Sports Complex',
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
      duration: duration || '12:00',
      mvpPlayer: mvpPlayer || '',
      featuredPlayers: Array.isArray(featuredPlayers) ? featuredPlayers : [],
      keyMoments: Array.isArray(keyMoments) ? keyMoments : [],
      views: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await MatchHighlight.create(newHighlight);
    } catch (e) {}

    fallbackHighlights.unshift(newHighlight);

    if (req.user) {
      try {
        await logAuditEvent({
          actor: req.user,
          action: 'MATCH_HIGHLIGHT_CREATED',
          entity: 'CONTENT',
          entityId: newHighlight.id,
          details: { title: newHighlight.title },
          ipAddress: req.ip,
        });
      } catch (e) {}
    }

    return res.status(201).json({ success: true, data: newHighlight, message: 'Match highlight created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateMatchHighlight = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updated;
    try {
      updated = await MatchHighlight.findByIdAndUpdate(id, updates, { new: true });
    } catch (e) {}

    const index = fallbackHighlights.findIndex((h) => h.id === id);
    if (index !== -1) {
      fallbackHighlights[index] = { ...fallbackHighlights[index], ...updates };
      updated = fallbackHighlights[index];
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Highlight not found' });
    }

    return res.status(200).json({ success: true, data: updated, message: 'Highlight updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteMatchHighlight = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await MatchHighlight.findByIdAndDelete(id);
    } catch (e) {}

    fallbackHighlights = fallbackHighlights.filter((h) => h.id !== id);

    return res.status(200).json({ success: true, message: 'Match highlight deleted successfully' });
  } catch (error) {
    next(error);
  }
};
