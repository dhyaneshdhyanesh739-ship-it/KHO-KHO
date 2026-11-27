import TutorialVideo from '../models/TutorialVideo.js';
import TutorialProgress from '../models/TutorialProgress.js';
import { initialTutorialVideos } from '../data/khoKhoInitialData.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// In-memory fallback cache in case PostgreSQL is offline in sandboxed/development mode
let fallbackTutorials = [...initialTutorialVideos];
let fallbackProgress = new Set(); // set of "userIdentifier:tutorialId"

export const getTutorials = async (req, res, next) => {
  try {
    const { level, category, search } = req.query;
    let tutorials;

    try {
      const filter = {};
      if (level && level !== 'ALL') filter.level = level;
      if (category && category !== 'ALL') filter.category = category;
      if (search && search.trim()) {
        filter.$or = [
          { title: new RegExp(search.trim(), 'i') },
          { description: new RegExp(search.trim(), 'i') },
        ];
      }
      tutorials = await TutorialVideo.find(filter).sort({ order: 1, createdAt: -1 });
    } catch (dbErr) {
      // Use fallback
      tutorials = fallbackTutorials;
    }

    if (!tutorials || tutorials.length === 0) {
      tutorials = fallbackTutorials;
    }

    // Apply filters in memory if needed
    if (level && level !== 'ALL') {
      tutorials = tutorials.filter((t) => t.level?.toUpperCase() === level.toUpperCase());
    }
    if (category && category !== 'ALL') {
      tutorials = tutorials.filter((t) => t.category?.toUpperCase() === category.toUpperCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      tutorials = tutorials.filter((t) =>
        t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: tutorials.length,
      data: tutorials,
    });
  } catch (error) {
    next(error);
  }
};

export const getTutorialById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let tutorial;
    try {
      tutorial = await TutorialVideo.findById(id);
    } catch (e) {
      tutorial = fallbackTutorials.find((t) => t.id === id);
    }
    if (!tutorial) {
      tutorial = fallbackTutorials.find((t) => t.id === id);
    }

    if (!tutorial) {
      return res.status(404).json({ success: false, message: 'Tutorial video not found' });
    }

    return res.status(200).json({ success: true, data: tutorial });
  } catch (error) {
    next(error);
  }
};

export const createTutorial = async (req, res, next) => {
  try {
    const { title, description, level, category, videoUrl, thumbnailUrl, duration, skills, order } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Title and video URL are required' });
    }

    const newTutorial = {
      id: `tut-${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      level: level || 'BEGINNER',
      category: category || 'RULES',
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
      duration: duration || '05:00',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      order: Number(order) || fallbackTutorials.length + 1,
      views: 0,
      likes: 0,
      author: req.user?.name || 'Coaching Staff',
      createdAt: new Date().toISOString(),
    };

    try {
      await TutorialVideo.create(newTutorial);
    } catch (e) {
      // Fallback
    }

    fallbackTutorials.unshift(newTutorial);

    if (req.user) {
      try {
        await logAuditEvent({
          actor: req.user,
          action: 'TUTORIAL_CREATED',
          entity: 'CONTENT',
          entityId: newTutorial.id,
          details: { title: newTutorial.title },
          ipAddress: req.ip,
        });
      } catch (e) {}
    }

    return res.status(201).json({ success: true, data: newTutorial, message: 'Tutorial video created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updated;
    try {
      updated = await TutorialVideo.findByIdAndUpdate(id, updates, { new: true });
    } catch (e) {}

    const index = fallbackTutorials.findIndex((t) => t.id === id);
    if (index !== -1) {
      fallbackTutorials[index] = { ...fallbackTutorials[index], ...updates };
      updated = fallbackTutorials[index];
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Tutorial not found' });
    }

    return res.status(200).json({ success: true, data: updated, message: 'Tutorial updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await TutorialVideo.findByIdAndDelete(id);
    } catch (e) {}

    fallbackTutorials = fallbackTutorials.filter((t) => t.id !== id);

    return res.status(200).json({ success: true, message: 'Tutorial video deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleTutorialProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userIdentifier = req.user?.username || req.user?.id || req.body.userIdentifier || 'guest_user';
    const key = `${userIdentifier}:${id}`;

    let completed = false;
    if (fallbackProgress.has(key)) {
      fallbackProgress.delete(key);
      completed = false;
    } else {
      fallbackProgress.add(key);
      completed = true;
    }

    try {
      if (completed) {
        await TutorialProgress.create({ userIdentifier, tutorialId: id, completed: true });
      } else {
        await TutorialProgress.deleteMany({ userIdentifier, tutorialId: id });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      tutorialId: id,
      completed,
      message: completed ? 'Tutorial marked as completed!' : 'Tutorial marked as uncompleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProgress = async (req, res, next) => {
  try {
    const userIdentifier = req.user?.username || req.user?.id || req.query.userIdentifier || 'guest_user';
    const completedIds = [];

    for (const key of fallbackProgress) {
      if (key.startsWith(`${userIdentifier}:`)) {
        completedIds.push(key.split(':')[1]);
      }
    }

    const totalTutorials = fallbackTutorials.length;
    const completedCount = completedIds.length;
    const percentage = totalTutorials > 0 ? Math.round((completedCount / totalTutorials) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        completedIds,
        completedCount,
        totalTutorials,
        percentage,
      },
    });
  } catch (error) {
    next(error);
  }
};
