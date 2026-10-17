import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    caption: {
      type: String,
      default: '',
      maxlength: 300,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL or path is required'],
    },
    category: {
      type: String,
      enum: ['Action', 'Celebration', 'Training', 'Trophies', 'Team'],
      default: 'Action',
    },
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS', 'ALL'],
      default: 'ALL',
    },
  },
  {
    timestamps: true,
  }
);

galleryItemSchema.index({ category: 1, team: 1 });

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
export default GalleryItem;
