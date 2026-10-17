import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: [true, 'Session reference is required'],
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: [true, 'Player reference is required'],
    },
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS'],
      required: [true, 'Team is required'],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    status: {
      type: String,
      enum: {
        values: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
        message: '{VALUE} is not a valid attendance status',
      },
      required: [true, 'Status is required'],
    },
    notes: {
      type: String,
      default: '',
      maxlength: 300,
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
  },
  {
    timestamps: true,
  }
);

// Compound unique index prevents duplicate attendance records for the same player in the same session
attendanceRecordSchema.index({ session: 1, player: 1 }, { unique: true });
// Indices for fast player reports, team dates, and aggregation
attendanceRecordSchema.index({ player: 1, date: -1 });
attendanceRecordSchema.index({ team: 1, date: -1, status: 1 });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
export default AttendanceRecord;
