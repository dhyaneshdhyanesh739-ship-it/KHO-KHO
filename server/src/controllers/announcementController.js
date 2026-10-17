import Announcement from '../models/Announcement.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const team = req.targetTeam === 'ALL' ? (req.query.team || 'ALL') : req.targetTeam;
    const filter = {
      $or: [{ team }, { team: 'ALL' }],
    };

    // If player, only return published
    if (req.user && req.user.role === 'PLAYER') {
      filter.published = true;
    }

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'name username');

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const team = req.targetTeam;
    const { title, message, category = 'GENERAL', isUrgent = false, published = true } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const announcement = await Announcement.create({
      team: req.user.role === 'SUPER_ADMIN' ? (req.body.team || 'ALL') : team,
      title: title.trim(),
      message: message.trim(),
      category,
      isUrgent: !!isUrgent,
      published: !!published,
      author: req.user._id,
      authorName: req.user.name || 'Coaching Staff',
    });

    await logAuditEvent({
      actor: req.user,
      team: announcement.team,
      action: 'ANNOUNCEMENT_CREATED',
      entity: 'ANNOUNCEMENT',
      entityId: announcement._id.toString(),
      details: { title: announcement.title, category: announcement.category },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && announcement.team !== req.user.team && announcement.team !== 'ALL') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const { title, message, category, isUrgent, published } = req.body;
    if (title) announcement.title = title.trim();
    if (message) announcement.message = message.trim();
    if (category) announcement.category = category;
    if (typeof isUrgent === 'boolean') announcement.isUrgent = isUrgent;
    if (typeof published === 'boolean') announcement.published = published;

    await announcement.save();

    await logAuditEvent({
      actor: req.user,
      team: announcement.team,
      action: 'ANNOUNCEMENT_UPDATED',
      entity: 'ANNOUNCEMENT',
      entityId: announcement._id.toString(),
      details: { title: announcement.title },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && announcement.team !== req.user.team && announcement.team !== 'ALL') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await announcement.deleteOne();

    await logAuditEvent({
      actor: req.user,
      team: announcement.team,
      action: 'ANNOUNCEMENT_DELETED',
      entity: 'ANNOUNCEMENT',
      entityId: announcement._id.toString(),
      details: { title: announcement.title },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted.',
    });
  } catch (error) {
    next(error);
  }
};
