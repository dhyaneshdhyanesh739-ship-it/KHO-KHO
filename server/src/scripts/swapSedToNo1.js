import { connectDB } from '../config/db.js';
import prisma from '../config/prisma.js';

async function main() {
  console.log('[Swap] Connecting to database...');
  await connectDB();

  // Find S.E.D and MOHAN
  const sed = await prisma.player.findFirst({
    where: { name: { contains: 'S.E.D', mode: 'insensitive' }, team: 'BOYS' },
  });

  const mohan = await prisma.player.findFirst({
    where: { name: { contains: 'MOHAN', mode: 'insensitive' }, team: 'BOYS' },
  });

  if (!sed) {
    throw new Error('Player S.E.D not found');
  }
  if (!mohan) {
    throw new Error('Player MOHAN not found');
  }

  console.log(`[Swap] Current S.E.D: ID=${sed.playerId}, Jersey=${sed.jerseyNumber}, Pos=${sed.position}`);
  console.log(`[Swap] Current MOHAN: ID=${mohan.playerId}, Jersey=${mohan.jerseyNumber}, Pos=${mohan.position}`);

  // Step 1: Temporarily move Mohan out of jersey #1 to avoid unique constraint clash
  await prisma.player.update({
    where: { id: mohan.id },
    data: {
      jerseyNumber: 999,
      playerId: 'B-TEMP-999',
    },
  });

  // Step 2: Set S.E.D to Position #1 (Jersey 1, B-01, All-Rounder)
  const updatedSed = await prisma.player.update({
    where: { id: sed.id },
    data: {
      playerId: 'B-01',
      jerseyNumber: 1,
      position: 'All-Rounder',
    },
  });

  // Step 3: Set MOHAN to Jersey 9, B-09
  const updatedMohan = await prisma.player.update({
    where: { id: mohan.id },
    data: {
      playerId: 'B-09',
      jerseyNumber: 9,
    },
  });

  console.log(`[Swap] SUCCESS!`);
  console.log(`[Swap] New S.E.D: ID=${updatedSed.playerId}, Jersey=${updatedSed.jerseyNumber}, Pos=${updatedSed.position}`);
  console.log(`[Swap] New MOHAN: ID=${updatedMohan.playerId}, Jersey=${updatedMohan.jerseyNumber}, Pos=${updatedMohan.position}`);

  process.exit(0);
}

main().catch((err) => {
  console.error('[Swap Error]:', err);
  process.exit(1);
});
