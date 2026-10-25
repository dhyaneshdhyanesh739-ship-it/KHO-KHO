import Achievement from '../models/Achievement.js';
import GalleryItem from '../models/GalleryItem.js';
import ContactMessage from '../models/ContactMessage.js';
import AuditLog from '../models/AuditLog.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// ==================== ACHIEVEMENTS ====================
export const getAchievements = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'ALL') filter.category = category;

    const achievements = await Achievement.find(filter).sort({ year: -1 });
    return res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    next(error);
  }
};

export const createAchievement = async (req, res, next) => {
  try {
    const { title, year, event, result, description, image, category = 'COMBINED' } = req.body;
    if (!title || !year || !event || !result) {
      return res.status(400).json({ success: false, message: 'Title, year, event, and result are required.' });
    }

    const achievement = await Achievement.create({
      title: title.trim(),
      year: Number(year),
      event: event.trim(),
      result: result.trim(),
      description: description || '',
      image: image || '',
      category,
    });

    await logAuditEvent({
      actor: req.user,
      team: category === 'COMBINED' ? 'ALL' : category,
      action: 'ACHIEVEMENT_CREATED',
      entity: 'SYSTEM',
      entityId: achievement._id.toString(),
      details: { title: achievement.title, year: achievement.year },
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Achievement added.', data: achievement });
  } catch (error) {
    next(error);
  }
};

export const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found.' });
    }
    // Authorization check: ensure the requester belongs to the same team/category
    if (req.user.role !== 'SUPER_ADMIN' && achievement.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions.' });
    }
    await Achievement.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Achievement removed.' });
  } catch (error) {
    next(error);
  }
};

// ==================== GALLERY ====================
export const getGallery = async (req, res, next) => {
  try {
    const { category, team } = req.query;
    const filter = {};
    if (category && category !== 'ALL') filter.category = category;
    if (team && team !== 'ALL') filter.team = { $in: [team, 'ALL'] };

    const items = await GalleryItem.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req, res, next) => {
  try {
    const { title, caption, imageUrl, category = 'Action', team = 'ALL' } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and image URL are required.' });
    }

    const item = await GalleryItem.create({
      title: title.trim(),
      caption: caption || '',
      imageUrl: imageUrl.trim(),
      category,
      team,
    });

    return res.status(201).json({ success: true, message: 'Gallery item added.', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }
    if (req.user.role !== 'SUPER_ADMIN' && item.team !== req.user.team) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions.' });
    }
    await GalleryItem.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Gallery item removed.' });
  } catch (error) {
    next(error);
  }
};

// ==================== CONTACT FORM ====================
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject, and message are required.' });
    }

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim(),
      status: 'UNREAD',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received by our coaching administration. We will get back to you shortly.',
      id: newMessage._id,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// ==================== AUDIT LOGS ====================
export const getAuditLogs = async (req, res, next) => {
  try {
    const user = req.user;
    const filter = {};

    if (user.role === 'BOYS_ADMIN') {
      filter.team = { $in: ['BOYS', 'ALL'] };
    } else if (user.role === 'GIRLS_ADMIN') {
      filter.team = { $in: ['GIRLS', 'ALL'] };
    }

    const { limit = 50 } = req.query;
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
