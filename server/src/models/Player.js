import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    playerId: {
      type: String,
      required: [true, 'Player ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Player full name is required'],
      trim: true,
      maxlength: 100,
    },
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS'],
      required: [true, 'Team must be BOYS or GIRLS'],
    },
    jerseyNumber: {
      type: Number,
      required: [true, 'Jersey number is required'],
      min: [1, 'Jersey number must be at least 1'],
      max: [99, 'Jersey number cannot exceed 99'],
    },
    position: {
      type: String,
      enum: ['Chaser', 'Defender', 'All-Rounder', 'Pole Diver', 'Running Chaser'],
      default: 'All-Rounder',
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    heightCm: {
      type: Number,
      default: null,
    },
    weightKg: {
      type: Number,
      default: null,
    },
    contactInfo: {
      phone: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, lowercase: true, default: '' },
      emergencyContactName: { type: String, trim: true, default: '' },
      emergencyPhone: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to ensure jersey numbers are unique per team
playerSchema.index({ team: 1, jerseyNumber: 1 }, { unique: true });
// Fast lookup indices
playerSchema.index({ team: 1, active: 1 });
playerSchema.index({ name: 'text', playerId: 'text' });

const Player = mongoose.model('Player', playerSchema);
export default Player;
