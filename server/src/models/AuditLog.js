import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorUsername: {
      type: String,
      required: true,
      default: 'system',
    },
    actorRole: {
      type: String,
      required: true,
      default: 'SYSTEM',
    },
    team: {
      type: String,
      enum: ['BOYS', 'GIRLS', 'ALL', 'SYSTEM'],
      required: true,
      default: 'ALL',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entity: {
      type: String,
      enum: ['ATTENDANCE', 'PLAYER', 'SQUAD', 'USER', 'ANNOUNCEMENT', 'MATCH', 'AUTH', 'SYSTEM'],
      required: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

auditLogSchema.index({ team: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
