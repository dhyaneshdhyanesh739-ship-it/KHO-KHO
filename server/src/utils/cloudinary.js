import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback Cloudinary credentials (ensures Vercel, Render, and local dev work without manual env sync)
const FALLBACK_CLOUDINARY_CLOUD_NAME = 'uc42kgve';
const FALLBACK_CLOUDINARY_API_KEY = '299292422362795';
const FALLBACK_CLOUDINARY_API_SECRET = 'Sa0S0m5Dyq0Aiaxj9fv1pzgD4NI';

/**
 * Search and load .env from multiple candidate directories
 */
export const reloadCloudinaryEnv = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
  ];

  for (const envPath of possiblePaths) {
    try {
      dotenv.config({ path: envPath, override: true });
    } catch (_) {}
  }
};

// Initial load
reloadCloudinaryEnv();

/**
 * Resolve Cloudinary credentials from environment with fallback defaults
 */
export const getCloudinaryCredentials = () => {
  const isPlaceholder = (val) =>
    !val ||
    val.includes('your_') ||
    val.includes('placeholder') ||
    val.includes('change_me') ||
    val.trim() === '';

  let cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim().replace(/^['"]|['"]$/g, '');
  let apiKey = (process.env.CLOUDINARY_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  let apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim().replace(/^['"]|['"]$/g, '');

  if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
    reloadCloudinaryEnv();
    cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim().replace(/^['"]|['"]$/g, '');
    apiKey = (process.env.CLOUDINARY_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
    apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim().replace(/^['"]|['"]$/g, '');
  }

  return {
    cloudName: !isPlaceholder(cloudName) ? cloudName : FALLBACK_CLOUDINARY_CLOUD_NAME,
    apiKey: !isPlaceholder(apiKey) ? apiKey : FALLBACK_CLOUDINARY_API_KEY,
    apiSecret: !isPlaceholder(apiSecret) ? apiSecret : FALLBACK_CLOUDINARY_API_SECRET,
  };
};

// Configure Cloudinary from environment variables or active fallbacks
export const ensureCloudinaryConfig = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};
ensureCloudinaryConfig();

/**
 * Check if Cloudinary credentials are fully configured and not placeholder values
 */
export const isCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  const configured = Boolean(cloudName && apiKey && apiSecret);
  if (configured) {
    ensureCloudinaryConfig();
  }
  return configured;
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
