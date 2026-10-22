import prisma from '../config/prisma.js';
import { createModelAdapter } from './prismaAdapter.js';

const AttendanceRecord = createModelAdapter('attendanceRecord');

AttendanceRecord.bulkWrite = async function (bulkOps = []) {
  for (const op of bulkOps) {
    if (op.updateOne) {
      const { filter, update } = op.updateOne;
      const session = String(filter.session._id || filter.session);
      const player = String(filter.player._id || filter.player);
      const set = update.$set || {};
      const setOnInsert = update.$setOnInsert || {};

      await prisma.attendanceRecord.upsert({
        where: {
          session_player: {
            session,
            player,
          },
        },
        update: {
          team: set.team,
          date: set.date,
          status: set.status,
          notes: set.notes || '',
          updatedBy: set.updatedBy ? String(set.updatedBy) : null,
        },
        create: {
          session,
          player,
          team: set.team,
          date: set.date,
          status: set.status,
          notes: set.notes || '',
          recordedBy: String(setOnInsert.recordedBy || set.updatedBy || ''),
          updatedBy: set.updatedBy ? String(set.updatedBy) : null,
        },
      });
    }
  }
  return { ok: 1 };
};

export default AttendanceRecord;
