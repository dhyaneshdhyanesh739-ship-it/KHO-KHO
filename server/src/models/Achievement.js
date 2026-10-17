import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      maxlength: 120,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1950,
      max: 2050,
    },
    event: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: 150,
    },
    result: {
      type: String,
      required: [true, 'Result/Position is required (e.g. Gold Medal, Champion)'],
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['BOYS', 'GIRLS', 'COMBINED'],
      default: 'COMBINED',
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ year: -1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
