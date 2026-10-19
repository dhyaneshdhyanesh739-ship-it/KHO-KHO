import mongoose from 'mongoose';

const groundActivitySchema = new mongoose.Schema(
  {
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS', 'BOTH'],
      required: [true, 'Team is required (BOYS, GIRLS, or BOTH)'],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: 200,
    },
    focusArea: {
      type: String,
      default: 'General Ground Training',
      trim: true,
      maxlength: 100,
    },
    activities: {
      type: [String],
      required: [true, 'At least one activity or drill is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one ground drill or activity must be specified.',
      },
    },
    coachNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    sessionTime: {
      type: String,
      enum: ['MORNING', 'EVENING', 'AFTERNOON', 'FULL_DAY'],
      default: 'MORNING',
    },
    intensity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'INTENSE'],
      default: 'HIGH',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
      type: String,
      default: 'Head Coach',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by team and date
groundActivitySchema.index({ team: 1, date: -1 });

const GroundActivity = mongoose.model('GroundActivity', groundActivitySchema);
export default GroundActivity;
