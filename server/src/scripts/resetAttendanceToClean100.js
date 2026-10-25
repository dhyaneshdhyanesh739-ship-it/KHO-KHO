import prisma from '../config/prisma.js';

async function main() {
  console.log('[Reset Attendance] Connecting to database...');

  // 1. Count existing sessions and records
  const initialRecords = await prisma.attendanceRecord.count();
  const initialSessions = await prisma.attendanceSession.count();
  console.log(`Found ${initialSessions} sessions and ${initialRecords} attendance records.`);

  // 2. Clear all attendance records
  const deletedRecords = await prisma.attendanceRecord.deleteMany({});
  console.log(`[Deleted Records] Removed ${deletedRecords.count} attendance records.`);

  // 3. Clear all attendance sessions
  const deletedSessions = await prisma.attendanceSession.deleteMany({});
  console.log(`[Deleted Sessions] Removed ${deletedSessions.count} attendance sessions.`);

  // 4. Verify clean slate
  const finalRecords = await prisma.attendanceRecord.count();
  const finalSessions = await prisma.attendanceSession.count();

  console.log('--- RESET COMPLETE ---');
  console.log(`Remaining Attendance Records: ${finalRecords}`);
  console.log(`Remaining Attendance Sessions: ${finalSessions}`);
  console.log('All athletes (Boys & Girls) now start with a clean 100% Match Attendance and zero deductions.');
  console.log('Official attendance recording will begin tomorrow: 26-10-2026 onwards.');

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[Reset Attendance Error]:', err);
  await prisma.$disconnect();
  process.exit(1);
});
