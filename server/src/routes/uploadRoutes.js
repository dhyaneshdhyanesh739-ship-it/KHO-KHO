import express from 'express';
import multer from 'multer';
import { uploadProfilePhoto, getCloudinaryStatus } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure memory storage multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'), false);
    }
  },
});

// Check if Cloudinary is configured (public/protected)
router.get('/status', getCloudinaryStatus);

// Upload profile photo directly to Cloudinary (protected)
router.post('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);

export default router;
