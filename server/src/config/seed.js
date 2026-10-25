import { connectDB } from './db.js';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Player from '../models/Player.js';
import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Match from '../models/Match.js';
import MatchSquad from '../models/MatchSquad.js';
import Announcement from '../models/Announcement.js';
import Achievement from '../models/Achievement.js';
import GalleryItem from '../models/GalleryItem.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('[Seed] Beginning Kho-Kho Arena database population...');

  // 1. Clear existing collections for a clean, deterministic seed
  await User.deleteMany({});
  await Player.deleteMany({});
  await AttendanceSession.deleteMany({});
  await AttendanceRecord.deleteMany({});
  await Match.deleteMany({});
  await MatchSquad.deleteMany({});
  await Announcement.deleteMany({});
  await Achievement.deleteMany({});
  await GalleryItem.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('[Seed] Cleared existing records.');

  // 2. Create Administrative Accounts
  const dhyaneshPassword = await User.hashPassword('kiddo@khokho');
  const dhyaneshAdmin = await User.create({
    username: 'dhyanesh',
    passwordHash: dhyaneshPassword,
    name: 'Dhyanesh.S.E',
    email: 'dhyaneshdhyanesh739@gmail.com',
    role: 'SUPER_ADMIN',
    team: 'ALL',
    isActive: true,
  });

  const boysAdminPassword = await User.hashPassword('kiddo@khokho');
  const boysAdmin = await User.create({
    username: 'boysadmin',
    passwordHash: boysAdminPassword,
    name: 'Coach Dhyanesh.S.E & MuthuvelRaja.S',
    email: 'dhyaneshdhyanesh739@gmail.com',
    role: 'BOYS_ADMIN',
    team: 'BOYS',
    isActive: true,
  });

  const girlsAdminPassword = await User.hashPassword('kiddo@khokho');
  const girlsAdmin = await User.create({
    username: 'girlsadmin',
    passwordHash: girlsAdminPassword,
    name: 'Coach Keerthana',
    email: 'coach.keerthana@khokhoarena.org',
    role: 'GIRLS_ADMIN',
    team: 'GIRLS',
    isActive: true,
  });

  console.log('[Seed] Created Super Admin Dhyanesh, Boys Admin, and Girls Admin with password kiddo@khokho.');

  // 3. Create Boys Roster (21 Real Players from Sheet)
  const boysRosterData = [
    { id: 'B-01', username: 'mohan', name: 'MOHAN', jersey: 1, pos: 'Pole Diver', blood: 'O+' },
    { id: 'B-02', username: 'jelphin', name: 'JELPHIN', jersey: 2, pos: 'Running Chaser', blood: 'B+' },
    { id: 'B-03', username: 'vicky.v', name: 'VICKY.V', jersey: 3, pos: 'Defender', blood: 'A+' },
    { id: 'B-04', username: 'kishor', name: 'KISHOR', jersey: 4, pos: 'All-Rounder', blood: 'AB+' },
    { id: 'B-05', username: 'harshad', name: 'HARSHAD', jersey: 5, pos: 'Chaser', blood: 'O+' },
    { id: 'B-06', username: 'elan', name: 'ELAN', jersey: 6, pos: 'Defender', blood: 'B+' },
    { id: 'B-07', username: 'vimal.s', name: 'VIMAL.S', jersey: 7, pos: 'Pole Diver', blood: 'A-' },
    { id: 'B-08', username: 'karan', name: 'KARAN', jersey: 8, pos: 'Running Chaser', blood: 'O-' },
    { id: 'B-09', username: 'harish', name: 'HARISH', jersey: 9, pos: 'Defender', blood: 'A+' },
    { id: 'B-10', username: 's.e.d', name: 'S.E.D', jersey: 10, pos: 'All-Rounder', blood: 'B+' },
    { id: 'B-11', username: 'akash', name: 'AKASH', jersey: 11, pos: 'Chaser', blood: 'O+' },
    { id: 'B-12', username: 'sriram', name: 'SRIRAM', jersey: 12, pos: 'All-Rounder', blood: 'O+' },
    { id: 'B-13', username: 'mega', name: 'MEGA', jersey: 13, pos: 'Running Chaser', blood: 'B+' },
    { id: 'B-14', username: 'abhinav', name: 'ABHINAV', jersey: 14, pos: 'Defender', blood: 'O+' },
    { id: 'B-15', username: 'sanjay', name: 'SANJAY', jersey: 15, pos: 'All-Rounder', blood: 'A+' },
    { id: 'B-16', username: 'chithranjan', name: 'CHITHRANJAN', jersey: 16, pos: 'Chaser', blood: 'B-' },
    { id: 'B-17', username: 'dharshan', name: 'DHARSHAN', jersey: 17, pos: 'Pole Diver', blood: 'A+' },
    { id: 'B-18', username: 'sivaguru', name: 'SIVAGURU', jersey: 18, pos: 'Running Chaser', blood: 'AB+' },
    { id: 'B-19', username: 'subu', name: 'SUBU', jersey: 19, pos: 'All-Rounder', blood: 'B+' },
    { id: 'B-20', username: 'thangadurai', name: 'THANGADURAI', jersey: 20, pos: 'Defender', blood: 'A-' },
    { id: 'B-21', username: 'jeeva', name: 'JEEVA', jersey: 21, pos: 'Chaser', blood: 'B+' },
  ];

  const createdBoysPlayers = [];
  for (const p of boysRosterData) {
    const username = p.username;
    const pass = await User.hashPassword(`${username}@khokho`);
    const playerUser = await User.create({
      username,
      passwordHash: pass,
      name: p.name,
      email: `${username.replace(/\./g, '')}@khokhoarena.org`,
      role: 'PLAYER',
      team: 'BOYS',
      isActive: true,
    });

    const playerDoc = await Player.create({
      playerId: p.id,
      name: p.name,
      team: 'BOYS',
      jerseyNumber: p.jersey,
      position: p.pos,
      bloodGroup: p.blood,
      active: true,
      userRef: playerUser._id,
      contactInfo: {
        phone: `+91 98200 ${String(1000 + p.jersey).padStart(5, '0')}`,
        email: `${username.replace(/\./g, '')}@khokhoarena.org`,
        emergencyContactName: `Guardian of ${p.name}`,
        emergencyPhone: '+91 98200 99999',
      },
    });

    playerUser.playerRef = playerDoc._id;
    await playerUser.save();
    createdBoysPlayers.push(playerDoc);
  }
  console.log(`[Seed] Created ${createdBoysPlayers.length} Boys Players with username@khokho credentials.`);

  // 4. Create Girls Roster (13 Real Players from Sheet)
  const girlsRosterData = [
    { id: 'G-01', username: 'keerthana', name: 'KEERTHANA', jersey: 1, pos: 'Pole Diver', blood: 'O+' },
    { id: 'G-02', username: 'sabiksha', name: 'SABIKSHA', jersey: 2, pos: 'Running Chaser', blood: 'A+' },
    { id: 'G-03', username: 'atshaya', name: 'ATSHAYA', jersey: 3, pos: 'Defender', blood: 'B+' },
    { id: 'G-04', username: 'nisha', name: 'NISHA', jersey: 4, pos: 'All-Rounder', blood: 'AB+' },
    { id: 'G-05', username: 'juna', name: 'JUNA', jersey: 5, pos: 'Chaser', blood: 'O+' },
    { id: 'G-06', username: 'sharmitha', name: 'SHARMITHA', jersey: 6, pos: 'Defender', blood: 'A-' },
    { id: 'G-07', username: 'lohii', name: 'LOHII', jersey: 7, pos: 'Pole Diver', blood: 'B+' },
    { id: 'G-08', username: 'subitha', name: 'SUBITHA', jersey: 8, pos: 'Running Chaser', blood: 'O-' },
    { id: 'G-09', username: 'shana', name: 'SHANA', jersey: 9, pos: 'Defender', blood: 'B+' },
    { id: 'G-10', username: 'madhu', name: 'MADHU', jersey: 10, pos: 'All-Rounder', blood: 'A+' },
    { id: 'G-11', username: 'pooja', name: 'POOJA', jersey: 11, pos: 'Chaser', blood: 'O+' },
    { id: 'G-12', username: 'vidhya', name: 'VIDHYA', jersey: 12, pos: 'Defender', blood: 'AB-' },
    { id: 'G-13', username: 'reeta', name: 'REETA', jersey: 13, pos: 'Pole Diver', blood: 'B+' },
  ];

  const createdGirlsPlayers = [];
  for (const p of girlsRosterData) {
    const username = p.username;
    const pass = await User.hashPassword(`${username}@khokho`);
    const playerUser = await User.create({
      username,
      passwordHash: pass,
      name: p.name,
      email: `${username}@khokhoarena.org`,
      role: 'PLAYER',
      team: 'GIRLS',
      isActive: true,
    });

    const playerDoc = await Player.create({
      playerId: p.id,
      name: p.name,
      team: 'GIRLS',
      jerseyNumber: p.jersey,
      position: p.pos,
      bloodGroup: p.blood,
      active: true,
      userRef: playerUser._id,
      contactInfo: {
        phone: `+91 97100 ${String(1000 + p.jersey).padStart(5, '0')}`,
        email: `${username}@khokhoarena.org`,
        emergencyContactName: `Guardian of ${p.name}`,
        emergencyPhone: '+91 97100 88888',
      },
    });

    playerUser.playerRef = playerDoc._id;
    await playerUser.save();
    createdGirlsPlayers.push(playerDoc);
  }
  console.log(`[Seed] Created ${createdGirlsPlayers.length} Girls Players with username@khokho credentials.`);

  // 5. Attendance Slate (Attendance officially starts from 26-10-2026 onwards with 100% base match attendance quota)
  console.log('[Seed] Attendance slate initialized clean. Official recording begins 26-10-2026 with 100% full quota for all athletes.');

  // 6. Create Matches
  const boysMatch1Date = new Date(today);
  boysMatch1Date.setDate(today.getDate() + 5);
  boysMatch1Date.setHours(16, 0, 0, 0);

  const boysMatch2Date = new Date(today);
  boysMatch2Date.setDate(today.getDate() + 12);
  boysMatch2Date.setHours(17, 30, 0, 0);

  const matchBoys1 = await Match.create({
    team: 'BOYS',
    opponent: 'Maharashtra Warriors Kho-Kho Club',
    competition: 'West Zone Inter-Collegiate Championship 2026',
    venue: 'Shivaji Park Sports Complex, Court 1, Mumbai',
    matchDate: boysMatch1Date,
    squadSize: 15,
    eligibilityMinAttendancePct: 75,
    status: 'SCHEDULED',
    createdBy: boysAdmin._id,
  });

  const matchBoys2 = await Match.create({
    team: 'BOYS',
    opponent: 'Karnataka Strikers',
    competition: 'National University Invitational Kho-Kho Trophy',
    venue: 'Kanteerava Stadium Court, Bangalore',
    matchDate: boysMatch2Date,
    squadSize: 15,
    eligibilityMinAttendancePct: 75,
    status: 'SCHEDULED',
    createdBy: boysAdmin._id,
  });

  const girlsMatch1Date = new Date(today);
  girlsMatch1Date.setDate(today.getDate() + 6);
  girlsMatch1Date.setHours(15, 0, 0, 0);

  const matchGirls1 = await Match.create({
    team: 'GIRLS',
    opponent: 'Gujarat Queens',
    competition: 'All-India Inter-University Women’s Kho-Kho Trophy',
    venue: 'Sardar Patel Sports Enclave, Ahmedabad',
    matchDate: girlsMatch1Date,
    squadSize: 14,
    eligibilityMinAttendancePct: 75,
    status: 'SCHEDULED',
    createdBy: girlsAdmin._id,
  });

  console.log('[Seed] Created upcoming matches for Boys and Girls.');

  // 7. Create Announcements
  await Announcement.create([
    {
      team: 'ALL',
      title: 'Welcome to the 2026-27 National Kho-Kho Season',
      message: 'Regular season training commences this week. Daily attendance is mandatory for match squad eligibility. Please verify your kits and timing with respective team head coaches.',
      category: 'GENERAL',
      isUrgent: true,
      published: true,
      author: dhyaneshAdmin._id,
      authorName: 'Athletics Directorate',
    },
    {
      team: 'BOYS',
      title: 'Mandatory Pole Turn & Diving Speed Assessment',
      message: 'Tomorrow morning practice will feature timed pole turnaround drills and diving evasion techniques. Please report in regulation shoes at 06:15 AM sharp.',
      category: 'PRACTICE',
      isUrgent: false,
      published: true,
      author: boysAdmin._id,
      authorName: 'Coach Dhyanesh.S.E & MuthuvelRaja.S',
    },
    {
      team: 'GIRLS',
      title: 'Gujarat Queens Match Preparation & Batch Running Drills',
      message: 'Tactical session on 3-batch running discipline scheduled for Wednesday afternoon. All defenders must review opponent chase patterns.',
      category: 'MATCH',
      isUrgent: false,
      published: true,
      author: girlsAdmin._id,
      authorName: 'Coach Keerthana',
    },
  ]);

  // 8. Create Achievements (Real Tournament Photos & Records)
  await Achievement.create([
    {
      title: 'Championship Trophy — Coimbatore Institute of Technology',
      year: 2025,
      event: 'Coimbatore Institute of Technology (CIT) State Tournament',
      result: 'Champions & Gold Trophy',
      description: 'Unstoppable championship campaign by the team, clinching the prestigious trophy at Coimbatore Institute of Technology.',
      image: '/achievements/cit_champions_trophy.jpg',
      category: 'BOYS',
    },
    {
      title: 'Runners-Up — Inter-Collegiate UDHAYAM Tournament',
      year: 2025,
      event: 'KIT - Kalaignarkarunanidhi Institute of Technology, Coimbatore',
      result: 'Runner-Up (Silver Trophy)',
      description: 'Tenacious defensive performance and runner-up podium finish in the prestigious state-level UDHAYAM tournament.',
      image: '/achievements/kit_udhayam_runners.jpg',
      category: 'BOYS',
    },
    {
      title: 'State Level Floodlight Trophy Winners',
      year: 2025,
      event: 'All-India Open Floodlight Night Kho-Kho Championship',
      result: 'Champions Under Floodlights',
      description: 'High-voltage night matches under arena floodlights, displaying electrifying pole turns and decisive match points.',
      image: '/achievements/floodlight_night_trophy.jpg',
      category: 'COMBINED',
    },
    {
      title: 'Winners 🥇 — Team Titans Championship',
      year: 2024,
      event: 'Team Titans Invitational Kho-Kho Trophy',
      result: 'Winners & Champions (Gold Medal)',
      description: 'Dominant all-out victories by the Team Titans squad with masterclass defensive running and offensive chases.',
      image: '/achievements/team_titans_winners.jpg',
      category: 'BOYS',
    },
    {
      title: 'Champions Lineup — CIT Annual Kho-Kho Meet',
      year: 2024,
      event: 'Coimbatore Institute of Technology Annual Tournament',
      result: 'Trophy Champions & Fair Play Award',
      description: 'Full tournament squad and coaches lined up on the court celebrating the coveted championship cup with coaches.',
      image: '/achievements/cit_ground_lineup.jpg',
      category: 'BOYS',
    },
    {
      title: 'Champions — All India Inter-Collegiate Invitational Cup',
      year: 2025,
      event: 'South Zone Inter-Collegiate Sports Festival',
      result: 'Winners & Fair Play Trophy',
      description: 'Historic triumph by the Boys squad with immaculate 3-batch defensive survival and tactical teamwork.',
      image: '/achievements/cit_champions_trophy.jpg',
      category: 'BOYS',
    },
  ]);

  // 9. Create Gallery (Arena in Motion)
  await GalleryItem.create([
    {
      title: 'CIT Kho-Kho Champions Trophy Collage',
      caption: 'Championship celebration and trophy presentation at Coimbatore Institute of Technology.',
      category: 'Trophies',
      team: 'BOYS',
      imageUrl: '/achievements/cit_champions_trophy.jpg',
    },
    {
      title: 'KIT UDHAYAM State Tournament Runners-Up',
      caption: 'Podium runners-up finish and trophy at KIT-Kalaignarkarunanidhi Institute of Technology.',
      category: 'Trophies',
      team: 'BOYS',
      imageUrl: '/achievements/kit_udhayam_runners.jpg',
    },
    {
      title: 'Floodlight Night Championship Glory',
      caption: 'High-voltage night tournament victory under arena floodlights.',
      category: 'Celebration',
      team: 'COMBINED',
      imageUrl: '/achievements/floodlight_night_trophy.jpg',
    },
    {
      title: 'Team Titans Championship Winners',
      caption: 'Dominant championship campaign and victory celebrations by Team Titans.',
      category: 'Celebration',
      team: 'BOYS',
      imageUrl: '/achievements/team_titans_winners.jpg',
    },
    {
      title: 'CIT Annual Tournament Ground Presentation',
      caption: 'Full tournament squad and coaches on the field during the annual awards ceremony.',
      category: 'Action',
      team: 'BOYS',
      imageUrl: '/achievements/cit_ground_lineup.jpg',
    },
    {
      title: 'Intense Tactical Training & Match Drills',
      caption: 'Pre-match technical preparation, agility footwork, and strategy briefing.',
      category: 'Training',
      team: 'ALL',
      imageUrl: '/achievements/cit_court_match_raw.jpg',
    },
  ]);

  console.log('[Seed] Database seeding completed successfully.');
};

// If run directly via `npm run seed`
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  connectDB()
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Fatal Error:', err);
      process.exit(1);
    });
}
