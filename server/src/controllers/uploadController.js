import { uploadToCloudinary, isCloudinaryConfigured } from '../utils/cloudinary.js';
import User from '../models/User.js';
import Player from '../models/Player.js';

/**
 * Upload athlete profile photo to Cloudinary
 * POST /api/upload/profile-photo
 */
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    const { image, photoData } = req.body;
    const filePayload = image || photoData || (req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null);

    if (!filePayload) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please send a base64 image or upload a file.',
      });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(400).json({
        success: false,
        isConfigured: false,
        message:
          'Cloudinary is not configured on the server. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env.',
      });
    }

    // Generate unique identifier tag for athlete
    const playerId = req.user?.playerRef || req.user?._id || req.user?.id || 'guest';
    const uploadRes = await uploadToCloudinary(filePayload, {
      public_id: `athlete_${playerId}_${Date.now()}`,
      tags: ['khokho_arena', 'athlete_profile', req.user?.team || 'general'],
    });

    // Automatically update the player's photoUrl if user has an associated player record
    let updatedPlayer = null;
    try {
      if (req.user?.playerRef) {
        updatedPlayer = await Player.findById(req.user.playerRef);
      }
      if (!updatedPlayer && req.user?._id) {
        updatedPlayer = await Player.findOne({ userRef: req.user._id });
      }
      if (updatedPlayer) {
        updatedPlayer.photoUrl = uploadRes.url;
        await updatedPlayer.save();
      }
    } catch (saveErr) {
      console.warn('[Upload] Could not automatically bind player document:', saveErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Profile photo successfully uploaded and stored in Cloudinary!',
      url: uploadRes.url,
      publicId: uploadRes.publicId,
      format: uploadRes.format,
      bytes: uploadRes.bytes,
      isCloudinary: true,
      player: updatedPlayer ? (typeof updatedPlayer.toJSON === 'function' ? updatedPlayer.toJSON() : updatedPlayer) : null,
    });
  } catch (error) {
    console.error('[UploadController] Cloudinary upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to Cloudinary.',
    });
  }
};

/**
 * Check whether Cloudinary credentials are configured
 * GET /api/upload/status
 */
export const getCloudinaryStatus = async (req, res) => {
  const configured = isCloudinaryConfigured();
  return res.status(200).json({
    success: true,
    isConfigured: configured,
    cloudName: configured ? process.env.CLOUDINARY_CLOUD_NAME : null,
    provider: 'Cloudinary Media Storage',
  });
};
