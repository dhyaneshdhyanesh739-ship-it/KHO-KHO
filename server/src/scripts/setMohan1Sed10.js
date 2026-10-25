import prisma from '../config/prisma.js';

async function main() {
  console.log('[Jersey Update] Connecting to database...');

  // 1. Fetch Mohan, S.E.D, and Harish
  const mohan = await prisma.player.findFirst({
    where: { name: { contains: 'MOHAN', mode: 'insensitive' }, team: 'BOYS' },
  });
  const sed = await prisma.player.findFirst({
    where: { name: { contains: 'S.E.D', mode: 'insensitive' }, team: 'BOYS' },
  });
  const harish = await prisma.player.findFirst({
    where: { name: { contains: 'HARISH', mode: 'insensitive' }, team: 'BOYS' },
  });

  if (!mohan || !sed || !harish) {
    throw new Error(`Players not found: Mohan=${!!mohan}, SED=${!!sed}, Harish=${!!harish}`);
  }

  console.log(`Current Mohan: ID=${mohan.playerId}, Jersey=${mohan.jerseyNumber}`);
  console.log(`Current S.E.D: ID=${sed.playerId}, Jersey=${sed.jerseyNumber}`);
  console.log(`Current Harish: ID=${harish.playerId}, Jersey=${harish.jerseyNumber}`);

  // Step 1: Temporarily assign temporary jersey numbers to avoid unique constraint collision
  await prisma.player.update({
    where: { id: mohan.id },
    data: { jerseyNumber: 991, playerId: 'B-TEMP-991' },
  });
  await prisma.player.update({
    where: { id: sed.id },
    data: { jerseyNumber: 992, playerId: 'B-TEMP-992' },
  });
  await prisma.player.update({
    where: { id: harish.id },
    data: { jerseyNumber: 993, playerId: 'B-TEMP-993' },
  });

  // Step 2: Assign desired jerseys:
  // MOHAN -> Jersey 1, B-01
  const updatedMohan = await prisma.player.update({
    where: { id: mohan.id },
    data: { jerseyNumber: 1, playerId: 'B-01' },
  });

  // HARISH -> Jersey 9, B-09
  const updatedHarish = await prisma.player.update({
    where: { id: harish.id },
    data: { jerseyNumber: 9, playerId: 'B-09' },
  });

  // S.E.D -> Jersey 10, B-10
  const updatedSed = await prisma.player.update({
    where: { id: sed.id },
    data: { jerseyNumber: 10, playerId: 'B-10' },
  });

  console.log('SUCCESS! Updated Jerseys:');
  console.log(`MOHAN: ID=${updatedMohan.playerId}, Jersey=${updatedMohan.jerseyNumber}`);
  console.log(`HARISH: ID=${updatedHarish.playerId}, Jersey=${updatedHarish.jerseyNumber}`);
  console.log(`S.E.D: ID=${updatedSed.playerId}, Jersey=${updatedSed.jerseyNumber}`);

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[Jersey Update Error]:', err);
  await prisma.$disconnect();
  process.exit(1);
});
