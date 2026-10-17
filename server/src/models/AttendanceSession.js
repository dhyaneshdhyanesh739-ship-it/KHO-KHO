import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema(
  {
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS'],
      required: [true, 'Team is required'],
    },
    date: {
      type: String, // Stored as ISO YYYY-MM-DD for deterministic queries without timezone shifts
      required: [true, 'Session date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    sessionLabel: {
      type: String,
      required: [true, 'Session label is required'],
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'FINALIZED'],
      default: 'DRAFT',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    totalEligible: {
      type: Number,
      default: 0,
    },
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
    totalLate: {
      type: Number,
      default: 0,
    },
    totalExcused: {
      type: Number,
      default: 0,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so duplicate sessions on the same day for a team with same label are prevented
attendanceSessionSchema.index({ team: 1, date: 1, sessionLabel: 1 }, { unique: true });
attendanceSessionSchema.index({ team: 1, date: -1 });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
export default AttendanceSession;
