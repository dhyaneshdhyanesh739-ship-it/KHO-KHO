import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Player from '../models/Player.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kho-kho-arena';

async function run() {
  console.log('[Update] Connecting to MongoDB at', mongoUri);
  await mongoose.connect(mongoUri);

  // 1. Setup / Update Admin Dhyanesh
  const adminPasswordHash = await bcrypt.hash('kiddo@khokho', 10);
  
  let dhyaneshUser = await User.findOne({ username: 'dhyanesh' });
  if (!dhyaneshUser) {
    dhyaneshUser = await User.create({
      username: 'dhyanesh',
      passwordHash: adminPasswordHash,
      name: 'Dhyanesh.S.E',
      email: 'dhyaneshdhyanesh739@gmail.com',
      role: 'SUPER_ADMIN',
      team: 'ALL',
      isActive: true,
    });
    console.log('[Update] Created Super Admin account: Dhyanesh');
  } else {
    dhyaneshUser.passwordHash = adminPasswordHash;
    dhyaneshUser.name = 'Dhyanesh.S.E';
    dhyaneshUser.email = 'dhyaneshdhyanesh739@gmail.com';
    dhyaneshUser.role = 'SUPER_ADMIN';
    dhyaneshUser.team = 'ALL';
    dhyaneshUser.isActive = true;
    await dhyaneshUser.save();
    console.log('[Update] Updated Super Admin account: Dhyanesh with password kiddo@khokho');
  }

  // Also update boysadmin & girlsadmin passwords to kiddo@khokho
  await User.updateOne({ username: 'boysadmin' }, { $set: { passwordHash: adminPasswordHash } });
  await User.updateOne({ username: 'girlsadmin' }, { $set: { passwordHash: adminPasswordHash } });
  console.log('[Update] Updated boysadmin & girlsadmin passwords to kiddo@khokho');

  // 2. Setup Boys Roster from user sheet
  const boysRoster = [
    { id: 'B-01', username: 'mohan', name: 'MOHAN', jersey: 1, pos: 'Pole Diver' },
    { id: 'B-02', username: 'jelphin', name: 'JELPHIN', jersey: 2, pos: 'Running Chaser' },
    { id: 'B-03', username: 'vicky.v', name: 'VICKY.V', jersey: 3, pos: 'Defender' },
    { id: 'B-04', username: 'kishore', name: 'KISHORE', jersey: 4, pos: 'All-Rounder' },
    { id: 'B-05', username: 'harshad', name: 'HARSHAD', jersey: 5, pos: 'Chaser' },
    { id: 'B-06', username: 'elan', name: 'ELAN', jersey: 6, pos: 'Defender' },
    { id: 'B-07', username: 'vimal.s', name: 'VIMAL.S', jersey: 7, pos: 'Pole Diver' },
    { id: 'B-08', username: 'karan', name: 'KARAN', jersey: 8, pos: 'Running Chaser' },
    { id: 'B-09', username: 's.e.d', name: 'S.E.D', jersey: 9, pos: 'All-Rounder' },
    { id: 'B-10', username: 'harish', name: 'HARISH', jersey: 10, pos: 'Defender' },
    { id: 'B-11', username: 'akash', name: 'AKASH', jersey: 11, pos: 'Chaser' },
    { id: 'B-12', username: 'suriya', name: 'SURIYA', jersey: 12, pos: 'Pole Diver' },
    { id: 'B-13', username: 'mega', name: 'MEGA', jersey: 13, pos: 'Running Chaser' },
    { id: 'B-14', username: 'abhinav', name: 'ABHINAV', jersey: 14, pos: 'Defender' },
    { id: 'B-15', username: 'sanjay', name: 'SANJAY', jersey: 15, pos: 'All-Rounder' },
    { id: 'B-16', username: 'lingesh', name: 'LINGESH', jersey: 16, pos: 'Chaser' },
    { id: 'B-17', username: 'paul', name: 'PAUL', jersey: 17, pos: 'Defender' },
    { id: 'B-18', username: 'katta', name: 'KATTA', jersey: 18, pos: 'Pole Diver' },
    { id: 'B-19', username: 'sivaguru', name: 'SIVAGURU', jersey: 19, pos: 'Running Chaser' },
    { id: 'B-20', username: 'kd', name: 'KD', jersey: 20, pos: 'All-Rounder' },
    { id: 'B-21', username: 'm.t.durai', name: 'M.T.DURAI', jersey: 21, pos: 'Defender' },
    { id: 'B-22', username: 'jeeva', name: 'JEEVA', jersey: 22, pos: 'Chaser' },
  ];

  // Remove old boys users and player records that do not match the new roster
  const newBoysUsernames = boysRoster.map((b) => b.username);
  const oldBoysUsers = await User.find({ team: 'BOYS', role: 'PLAYER' });
  for (const u of oldBoysUsers) {
    if (!newBoysUsernames.includes(u.username)) {
      await User.deleteOne({ _id: u._id });
      await Player.deleteOne({ userRef: u._id });
    }
  }

  // Also remove old player records with jersey > 22 for BOYS
  await Player.deleteMany({ team: 'BOYS', jerseyNumber: { $gt: 22 } });

  console.log('[Update] Upserting 22 Boys Players & Accounts...');
  for (const b of boysRoster) {
    const rawPass = `${b.username}@khokho`;
    const passwordHash = await bcrypt.hash(rawPass, 10);

    let playerUser = await User.findOne({ username: b.username });
    if (!playerUser) {
      playerUser = await User.create({
        username: b.username,
        passwordHash,
        name: b.name,
        email: `${b.username.replace(/\./g, '')}@khokhoarena.org`,
        role: 'PLAYER',
        team: 'BOYS',
        isActive: true,
      });
    } else {
      playerUser.passwordHash = passwordHash;
      playerUser.name = b.name;
      playerUser.isActive = true;
      await playerUser.save();
    }

    let playerDoc = await Player.findOne({ team: 'BOYS', jerseyNumber: b.jersey });
    if (!playerDoc) {
      playerDoc = await Player.create({
        playerId: b.id,
        name: b.name,
        team: 'BOYS',
        jerseyNumber: b.jersey,
        position: b.pos,
        active: true,
        userRef: playerUser._id,
        contactInfo: {
          phone: `+91 98200 ${String(1000 + b.jersey).padStart(5, '0')}`,
          email: `${b.username.replace(/\./g, '')}@khokhoarena.org`,
        },
      });
    } else {
      playerDoc.playerId = b.id;
      playerDoc.name = b.name;
      playerDoc.position = b.pos;
      playerDoc.userRef = playerUser._id;
      playerDoc.active = true;
      await playerDoc.save();
    }

    playerUser.playerRef = playerDoc._id;
    await playerUser.save();
  }

  const finalBoysCount = await Player.countDocuments({ team: 'BOYS' });
  const finalBoysUsers = await User.countDocuments({ team: 'BOYS', role: 'PLAYER' });
  console.log(`[Update] Completed! BOYS Players count: ${finalBoysCount}, BOYS Player Users: ${finalBoysUsers}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[Update] Error:', err);
  process.exit(1);
});
