import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS', 'ALL'],
      required: true,
      default: 'ALL',
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['PRACTICE', 'MATCH', 'TOURNAMENT', 'GENERAL', 'SQUAD'],
      default: 'GENERAL',
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      default: 'Coaching Staff',
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ team: 1, published: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
