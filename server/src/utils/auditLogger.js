import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  actor = null,
  actorUsername = 'system',
  actorRole = 'SYSTEM',
  team = 'ALL',
  action,
  entity,
  entityId = '',
  details = {},
  ipAddress = '',
}) => {
  try {
    await AuditLog.create({
      actor: actor?._id || actor || null,
      actorUsername: actor?.username || actorUsername,
      actorRole: actor?.role || actorRole,
      team: team || actor?.team || 'ALL',
      action,
      entity,
      entityId: String(entityId),
      details,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record audit log entry:', error.message);
  }
};
