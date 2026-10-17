import mongoose from 'mongoose';

const selectedPlayerSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    jerseyNumber: Number,
    name: String,
    position: String,
    roleInMatch: {
      type: String,
      default: 'Squad Member',
    },
    attendancePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    attendanceSessionsPresent: {
      type: Number,
      default: 0,
    },
    attendanceSessionsTotal: {
      type: Number,
      default: 0,
    },
    recommendationScore: {
      type: Number,
      default: 0,
    },
    rankingFactor: {
      type: String,
      default: '',
    },
    exceptionApproved: {
      type: Boolean,
      default: false,
    },
    exceptionReason: {
      type: String,
      default: '',
      maxlength: 300,
    },
  },
  { _id: false }
);

const reservePlayerSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    jerseyNumber: Number,
    name: String,
    position: String,
    attendancePercentage: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: 'Standby reserve',
    },
  },
  { _id: false }
);

const matchSquadSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      unique: true, // One squad document per match
    },
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS'],
      required: true,
    },
    selectedPlayers: [selectedPlayerSchema],
    reservePlayers: [reservePlayerSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'FINALIZED', 'PUBLISHED'],
      default: 'DRAFT',
    },
    maxSquadSize: {
      type: Number,
      required: true,
    },
    coachNotes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

matchSquadSchema.index({ team: 1, status: 1 });

const MatchSquad = mongoose.model('MatchSquad', matchSquadSchema);
export default MatchSquad;
