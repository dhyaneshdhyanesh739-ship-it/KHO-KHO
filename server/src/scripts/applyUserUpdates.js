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

  // 1. Setup / Update Super Admin Dhyanesh
  const superAdminPasswordHash = await bcrypt.hash('Dhyanesh@23012007', 10);
  const coachPasswordHash = await bcrypt.hash('kiddo@khokho', 10);
  
  let dhyaneshUser = await User.findOne({ username: 'dhyanesh' });
  if (!dhyaneshUser) {
    dhyaneshUser = await User.create({
      username: 'dhyanesh',
      passwordHash: superAdminPasswordHash,
      name: 'Dhyanesh.S.E',
      email: 'dhyaneshdhyanesh739@gmail.com',
      role: 'SUPER_ADMIN',
      team: 'ALL',
      isActive: true,
    });
    console.log('[Update] Created Super Admin account: Dhyanesh');
  } else {
    dhyaneshUser.username = 'dhyanesh';
    dhyaneshUser.passwordHash = superAdminPasswordHash;
    dhyaneshUser.name = 'Dhyanesh.S.E';
    dhyaneshUser.email = 'dhyaneshdhyanesh739@gmail.com';
    dhyaneshUser.role = 'SUPER_ADMIN';
    dhyaneshUser.team = 'ALL';
    dhyaneshUser.isActive = true;
    await dhyaneshUser.save();
    console.log('[Update] Updated Super Admin account: Dhyanesh (Email: dhyaneshdhyanesh739@gmail.com, Pass: Dhyanesh@23012007)');
  }

  // Also ensure superadmin account matches
  await User.updateOne(
    { username: 'superadmin' },
    { $set: { passwordHash: superAdminPasswordHash, email: 'dhyaneshdhyanesh739@gmail.com', name: 'Dhyanesh.S.E' } }
  );

  // Update boysadmin & girlsadmin passwords and name
  await User.updateOne(
    { username: 'boysadmin' },
    { $set: { passwordHash: coachPasswordHash, name: 'Coach Dhyanesh.S.E', isActive: true } }
  );
  await User.updateOne(
    { username: 'girlsadmin' },
    { $set: { passwordHash: coachPasswordHash, name: 'Coach Dhyanesh.S.E', isActive: true } }
  );
  console.log('[Update] Updated boysadmin & girlsadmin credentials (kiddo@khokho, Coach Dhyanesh.S.E)');

  // 2. Setup Boys Roster from user sheet (22 players)
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
      playerUser.team = 'BOYS';
      playerUser.role = 'PLAYER';
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

  // 3. Setup Girls Roster from user sheet (13 players)
  const girlsRoster = [
    { id: 'G-01', username: 'keerthana', name: 'KEERTHANA', jersey: 1, pos: 'Pole Diver' },
    { id: 'G-02', username: 'sabiksha', name: 'SABIKSHA', jersey: 2, pos: 'Running Chaser' },
    { id: 'G-03', username: 'atshaya', name: 'ATSHAYA', jersey: 3, pos: 'Defender' },
    { id: 'G-04', username: 'nisha', name: 'NISHA', jersey: 4, pos: 'All-Rounder' },
    { id: 'G-05', username: 'juna', name: 'JUNA', jersey: 5, pos: 'Chaser' },
    { id: 'G-06', username: 'sharmitha', name: 'SHARMITHA', jersey: 6, pos: 'Defender' },
    { id: 'G-07', username: 'lohii', name: 'LOHII', jersey: 7, pos: 'Pole Diver' },
    { id: 'G-08', username: 'subitha', name: 'SUBITHA', jersey: 8, pos: 'Running Chaser' },
    { id: 'G-09', username: 'shana', name: 'SHANA', jersey: 9, pos: 'Defender' },
    { id: 'G-10', username: 'madhu', name: 'MADHU', jersey: 10, pos: 'All-Rounder' },
    { id: 'G-11', username: 'pooja', name: 'POOJA', jersey: 11, pos: 'Chaser' },
    { id: 'G-12', username: 'vidhya', name: 'VIDHYA', jersey: 12, pos: 'Defender' },
    { id: 'G-13', username: 'reeta', name: 'REETA', jersey: 13, pos: 'Pole Diver' },
  ];

  // Remove old girls users and player records that do not match the new roster
  const newGirlsUsernames = girlsRoster.map((g) => g.username);
  const oldGirlsUsers = await User.find({ team: 'GIRLS', role: 'PLAYER' });
  for (const u of oldGirlsUsers) {
    if (!newGirlsUsernames.includes(u.username)) {
      await User.deleteOne({ _id: u._id });
      await Player.deleteOne({ userRef: u._id });
    }
  }
  await Player.deleteMany({ team: 'GIRLS', jerseyNumber: { $gt: 13 } });

  console.log('[Update] Upserting 13 Girls Players & Accounts...');
  for (const g of girlsRoster) {
    const rawPass = `${g.username}@khokho`;
    const passwordHash = await bcrypt.hash(rawPass, 10);

    let playerUser = await User.findOne({ username: g.username });
    if (!playerUser) {
      playerUser = await User.create({
        username: g.username,
        passwordHash,
        name: g.name,
        email: `${g.username}@khokhoarena.org`,
        role: 'PLAYER',
        team: 'GIRLS',
        isActive: true,
      });
    } else {
      playerUser.passwordHash = passwordHash;
      playerUser.name = g.name;
      playerUser.team = 'GIRLS';
      playerUser.role = 'PLAYER';
      playerUser.isActive = true;
      await playerUser.save();
    }

    let playerDoc = await Player.findOne({ team: 'GIRLS', jerseyNumber: g.jersey });
    if (!playerDoc) {
      playerDoc = await Player.create({
        playerId: g.id,
        name: g.name,
        team: 'GIRLS',
        jerseyNumber: g.jersey,
        position: g.pos,
        active: true,
        userRef: playerUser._id,
        contactInfo: {
          phone: `+91 97100 ${String(1000 + g.jersey).padStart(5, '0')}`,
          email: `${g.username}@khokhoarena.org`,
        },
      });
    } else {
      playerDoc.playerId = g.id;
      playerDoc.name = g.name;
      playerDoc.position = g.pos;
      playerDoc.userRef = playerUser._id;
      playerDoc.active = true;
      await playerDoc.save();
    }

    playerUser.playerRef = playerDoc._id;
    await playerUser.save();
  }

  const finalBoysCount = await Player.countDocuments({ team: 'BOYS' });
  const finalBoysUsers = await User.countDocuments({ team: 'BOYS', role: 'PLAYER' });
  const finalGirlsCount = await Player.countDocuments({ team: 'GIRLS' });
  const finalGirlsUsers = await User.countDocuments({ team: 'GIRLS', role: 'PLAYER' });

  console.log(`[Update] Completed!`);
  console.log(`[Update] BOYS Players: ${finalBoysCount}, BOYS Users: ${finalBoysUsers}`);
  console.log(`[Update] GIRLS Players: ${finalGirlsCount}, GIRLS Users: ${finalGirlsUsers}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[Update] Error:', err);
  process.exit(1);
});
