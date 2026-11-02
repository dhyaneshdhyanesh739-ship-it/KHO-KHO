import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary from environment variables
export const ensureCloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};
ensureCloudinaryConfig();

/**
 * Check if Cloudinary credentials are fully configured and not placeholder values
 */
export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  const isPlaceholder = (val) =>
    !val ||
    val.includes('your_') ||
    val.includes('placeholder') ||
    val.includes('change_me') ||
    val.trim() === '';
  return (
    !isPlaceholder(CLOUDINARY_CLOUD_NAME) &&
    !isPlaceholder(CLOUDINARY_API_KEY) &&
    !isPlaceholder(CLOUDINARY_API_SECRET)
  );
};

/**
 * Upload an image (base64 data URI, local path, or remote URL) directly to Cloudinary
 * @param {string} fileInput - Base64 Data URI (e.g. "data:image/jpeg;base64,...") or image URL
 * @param {object} customOptions - Extra upload options
 * @returns {Promise<{ url: string, publicId: string, format: string, bytes: number }>}
 */
export const uploadToCloudinary = async (fileInput, customOptions = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your server/.env file.'
    );
  }

  const defaultOptions = {
    folder: 'khokho-athletes',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
    transformation: [
      { width: 600, height: 600, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  };

  const uploadOptions = { ...defaultOptions, ...customOptions };
  ensureCloudinaryConfig();
  const result = await cloudinary.uploader.upload(fileInput, uploadOptions);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
  };
};

/**
 * Delete an image from Cloudinary by its publicId
 * @param {string} publicId
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete image ${publicId}:`, err.message);
    return null;
  }
};

export default cloudinary;
