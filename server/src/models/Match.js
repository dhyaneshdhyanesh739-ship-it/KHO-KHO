import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS'],
      required: [true, 'Team is required'],
    },
    opponent: {
      type: String,
      required: [true, 'Opponent name is required'],
      trim: true,
      maxlength: 100,
    },
    competition: {
      type: String,
      required: [true, 'Competition or tournament name is required'],
      trim: true,
      maxlength: 150,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      maxlength: 150,
    },
    matchDate: {
      type: Date,
      required: [true, 'Match date and time are required'],
    },
    squadSize: {
      type: Number,
      required: [true, 'Squad size limit is required'],
      min: [9, 'Squad size must be at least 9 (regulation Kho-Kho playing 9)'],
      max: [18, 'Squad size cannot exceed 18'],
      default: function () {
        return this.team === 'BOYS' ? 15 : 14;
      },
    },
    eligibilityMinAttendancePct: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'SQUAD_ANNOUNCED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    result: {
      teamScore: { type: Number, default: null },
      opponentScore: { type: Number, default: null },
      outcome: {
        type: String,
        enum: ['WIN', 'LOSS', 'DRAW', null],
        default: null,
      },
      matchSummary: { type: String, default: '' },
    },
    squadRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatchSquad',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ team: 1, matchDate: 1 });
matchSchema.index({ status: 1 });

const Match = mongoose.model('Match', matchSchema);
export default Match;
