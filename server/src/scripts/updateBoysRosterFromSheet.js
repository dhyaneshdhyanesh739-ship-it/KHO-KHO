import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

const boysRoster = [
  { id: 'B-01', username: 's.e.d', name: 'S.E.D', jersey: 1, pos: 'All-Rounder' },
  { id: 'B-02', username: 'jelphin', name: 'JELPHIN', jersey: 2, pos: 'Running Chaser' },
  { id: 'B-03', username: 'vicky.v', name: 'VICKY.V', jersey: 3, pos: 'Defender' },
  { id: 'B-04', username: 'kishor', name: 'KISHOR', jersey: 4, pos: 'All-Rounder' },
  { id: 'B-05', username: 'harshad', name: 'HARSHAD', jersey: 5, pos: 'Chaser' },
  { id: 'B-06', username: 'elan', name: 'ELAN', jersey: 6, pos: 'Defender' },
  { id: 'B-07', username: 'vimal.s', name: 'VIMAL.S', jersey: 7, pos: 'Pole Diver' },
  { id: 'B-08', username: 'karan', name: 'KARAN', jersey: 8, pos: 'Running Chaser' },
  { id: 'B-09', username: 'mohan', name: 'MOHAN', jersey: 9, pos: 'Pole Diver' },
  { id: 'B-10', username: 'harish', name: 'HARISH', jersey: 10, pos: 'Defender' },
  { id: 'B-11', username: 'akash', name: 'AKASH', jersey: 11, pos: 'Chaser' },
  { id: 'B-12', username: 'sriram', name: 'SRIRAM', jersey: 12, pos: 'All-Rounder' },
  { id: 'B-13', username: 'mega', name: 'MEGA', jersey: 13, pos: 'Running Chaser' },
  { id: 'B-14', username: 'abhinav', name: 'ABHINAV', jersey: 14, pos: 'Defender' },
  { id: 'B-15', username: 'sanjay', name: 'SANJAY', jersey: 15, pos: 'All-Rounder' },
  { id: 'B-16', username: 'chithranjan', name: 'CHITHRANJAN', jersey: 16, pos: 'Chaser' },
  { id: 'B-17', username: 'dharshan', name: 'DHARSHAN', jersey: 17, pos: 'Pole Diver' },
  { id: 'B-18', username: 'sivaguru', name: 'SIVAGURU', jersey: 18, pos: 'Running Chaser' },
  { id: 'B-19', username: 'subu', name: 'SUBU', jersey: 19, pos: 'All-Rounder' },
  { id: 'B-20', username: 'thangadurai', name: 'THANGADURAI', jersey: 20, pos: 'Defender' },
  { id: 'B-21', username: 'jeeva', name: 'JEEVA', jersey: 21, pos: 'Chaser' },
];

async function main() {
  console.log('[Update Boys] Starting update for 21 Boys Players & Accounts...');

  for (const b of boysRoster) {
    const rawPass = `${b.username}@khokho`;
    const passwordHash = await bcrypt.hash(rawPass, 10);

    // 1. Find or create Player by team + jerseyNumber
    let player = await prisma.player.findFirst({
      where: { team: 'BOYS', jerseyNumber: b.jersey },
    });

    if (!player) {
      player = await prisma.player.create({
        data: {
          playerId: b.id,
          name: b.name,
          team: 'BOYS',
          jerseyNumber: b.jersey,
          position: b.pos,
          active: true,
          contactInfo: {
            phone: `+91 98200 ${String(1000 + b.jersey).padStart(5, '0')}`,
            email: `${b.username.replace(/\./g, '')}@khokhoarena.org`,
          },
        },
      });
      console.log(`[Created Player] ${b.name} (${b.id}) Jersey #${b.jersey}`);
    } else {
      player = await prisma.player.update({
        where: { id: player.id },
        data: {
          playerId: b.id,
          name: b.name,
          position: b.pos,
          active: true,
        },
      });
      console.log(`[Updated Player] ${b.name} (${b.id}) Jersey #${b.jersey}`);
    }

    // 2. Find or create User by username
    let user = await prisma.user.findUnique({
      where: { username: b.username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: b.username,
          passwordHash,
          name: b.name,
          email: `${b.username.replace(/\./g, '')}@khokhoarena.org`,
          role: 'PLAYER',
          team: 'BOYS',
          playerRef: player.id,
          isActive: true,
        },
      });
      console.log(`[Created User] ${b.username} with pass: ${rawPass}`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          name: b.name,
          role: 'PLAYER',
          team: 'BOYS',
          playerRef: player.id,
          isActive: true,
        },
      });
      console.log(`[Updated User] ${b.username} with pass: ${rawPass}`);
    }

    // Link userRef on player
    await prisma.player.update({
      where: { id: player.id },
      data: { userRef: user.id },
    });
  }

  // Clean up old user accounts no longer on the roster
  const activeUsernames = boysRoster.map((b) => b.username);
  const oldUsers = await prisma.user.findMany({
    where: {
      team: 'BOYS',
      role: 'PLAYER',
      username: { notIn: activeUsernames },
    },
  });

  for (const oldU of oldUsers) {
    console.log(`[Removing Old User] ${oldU.username}`);
    await prisma.user.delete({ where: { id: oldU.id } });
  }

  console.log('[Update Boys] All 21 boys credentials synced successfully!');
  await prisma.$disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[Update Boys Error]:', err);
  await prisma.$disconnect();
  process.exit(1);
});
