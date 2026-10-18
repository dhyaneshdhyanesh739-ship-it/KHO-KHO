import mongoose from 'mongoose';
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
  const superAdminPassword = await User.hashPassword(process.env.INITIAL_SUPER_ADMIN_PASSWORD || 'SuperAdmin@KhoKho2026!');
  const superAdmin = await User.create({
    username: 'superadmin',
    passwordHash: superAdminPassword,
    name: 'Chief Athletics Director',
    email: 'director@khokhoarena.org',
    role: 'SUPER_ADMIN',
    team: 'ALL',
    isActive: true,
  });

  const boysAdminPassword = await User.hashPassword(process.env.INITIAL_BOYS_ADMIN_PASSWORD || 'BoysAdmin@KhoKho2026!');
  const boysAdmin = await User.create({
    username: 'boysadmin',
    passwordHash: boysAdminPassword,
    name: 'Coach Dhyanesh.S.E & MuthuvelRaja.S',
    email: 'coach.dhyanesh@khokhoarena.org',
    role: 'BOYS_ADMIN',
    team: 'BOYS',
    isActive: true,
  });

  const girlsAdminPassword = await User.hashPassword(process.env.INITIAL_GIRLS_ADMIN_PASSWORD || 'GirlsAdmin@KhoKho2026!');
  const girlsAdmin = await User.create({
    username: 'girlsadmin',
    passwordHash: girlsAdminPassword,
    name: 'Coach Keerthana',
    email: 'coach.keerthana@khokhoarena.org',
    role: 'GIRLS_ADMIN',
    team: 'GIRLS',
    isActive: true,
  });

  console.log('[Seed] Created Super Admin, Boys Admin, and Girls Admin.');

  // 3. Create Boys Roster (Exactly 23 Players as required)
  const boysRosterData = [
    { id: 'B-01', name: 'Arjun Shinde', jersey: 1, pos: 'Pole Diver', blood: 'O+' },
    { id: 'B-02', name: 'Rohan Kadam', jersey: 2, pos: 'Running Chaser', blood: 'B+' },
    { id: 'B-03', name: 'Pranav Sawant', jersey: 3, pos: 'Defender', blood: 'A+' },
    { id: 'B-04', name: 'Siddharth Jadhav', jersey: 4, pos: 'All-Rounder', blood: 'AB+' },
    { id: 'B-05', name: 'Aditya More', jersey: 5, pos: 'Chaser', blood: 'O+' },
    { id: 'B-06', name: 'Omkar Bhosale', jersey: 6, pos: 'Defender', blood: 'B+' },
    { id: 'B-07', name: 'Tanmay Salunkhe', jersey: 7, pos: 'Pole Diver', blood: 'A-' },
    { id: 'B-08', name: 'Yashwardhan Ghorpade', jersey: 8, pos: 'Running Chaser', blood: 'O-' },
    { id: 'B-09', name: 'Varun Gaikwad', jersey: 9, pos: 'Defender', blood: 'B+' },
    { id: 'B-10', name: 'Kunal Mane', jersey: 10, pos: 'All-Rounder', blood: 'A+' },
    { id: 'B-11', name: 'Harsh Vardhan', jersey: 11, pos: 'Chaser', blood: 'O+' },
    { id: 'B-12', name: 'Sahil Thorat', jersey: 12, pos: 'Defender', blood: 'AB-' },
    { id: 'B-13', name: 'Digvijay Rane', jersey: 13, pos: 'Pole Diver', blood: 'B+' },
    { id: 'B-14', name: 'Manish Shirole', jersey: 14, pos: 'Running Chaser', blood: 'O+' },
    { id: 'B-15', name: 'Tejas Nalawade', jersey: 15, pos: 'All-Rounder', blood: 'A+' },
    { id: 'B-16', name: 'Gaurav Chavan', jersey: 16, pos: 'Defender', blood: 'B-' },
    { id: 'B-17', name: 'Akshay Tawde', jersey: 17, pos: 'Chaser', blood: 'O+' },
    { id: 'B-18', name: 'Suraj Nikam', jersey: 18, pos: 'Defender', blood: 'A+' },
    { id: 'B-19', name: 'Rupesh Shirke', jersey: 19, pos: 'Running Chaser', blood: 'AB+' },
    { id: 'B-20', name: 'Mohit Bagwe', jersey: 20, pos: 'Pole Diver', blood: 'B+' },
    { id: 'B-21', name: 'Chetan Tambe', jersey: 21, pos: 'All-Rounder', blood: 'O+' },
    { id: 'B-22', name: 'Nikhil Pawar', jersey: 22, pos: 'Chaser', blood: 'A-' },
    { id: 'B-23', name: 'Virendra Shelar', jersey: 23, pos: 'Defender', blood: 'B+' },
  ];

  const createdBoysPlayers = [];
  for (const p of boysRosterData) {
    const username = p.id.toLowerCase().replace('-', '');
    const pass = await User.hashPassword(`${username}@KhoKho2026`);
    const playerUser = await User.create({
      username,
      passwordHash: pass,
      name: p.name,
      email: `${username}@arena.org`,
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
        email: `${username}@arena.org`,
        emergencyContactName: `Guardian of ${p.name}`,
        emergencyPhone: '+91 98200 99999',
      },
    });

    playerUser.playerRef = playerDoc._id;
    await playerUser.save();
    createdBoysPlayers.push(playerDoc);
  }
  console.log(`[Seed] Created ${createdBoysPlayers.length} Boys Players with active user accounts.`);

  // 4. Create Girls Roster (18 Players)
  const girlsRosterData = [
    { id: 'G-01', name: 'Pooja Narvekar', jersey: 1, pos: 'Pole Diver', blood: 'O+' },
    { id: 'G-02', name: 'Shreya Shinde', jersey: 2, pos: 'Running Chaser', blood: 'A+' },
    { id: 'G-03', name: 'Deepika Rathore', jersey: 3, pos: 'Defender', blood: 'B+' },
    { id: 'G-04', name: 'Sakshi Gole', jersey: 4, pos: 'All-Rounder', blood: 'AB+' },
    { id: 'G-05', name: 'Kavita Salvi', jersey: 5, pos: 'Chaser', blood: 'O+' },
    { id: 'G-06', name: 'Ritu Phogat', jersey: 6, pos: 'Defender', blood: 'A-' },
    { id: 'G-07', name: 'Snehal Jagtap', jersey: 7, pos: 'Pole Diver', blood: 'B+' },
    { id: 'G-08', name: 'Ankita Sawant', jersey: 8, pos: 'Running Chaser', blood: 'O-' },
    { id: 'G-09', name: 'Aishwarya Patil', jersey: 9, pos: 'Defender', blood: 'B+' },
    { id: 'G-10', name: 'Kalyani More', jersey: 10, pos: 'All-Rounder', blood: 'A+' },
    { id: 'G-11', name: 'Megha Jadhav', jersey: 11, pos: 'Chaser', blood: 'O+' },
    { id: 'G-12', name: 'Priyanka Ghuge', jersey: 12, pos: 'Defender', blood: 'AB-' },
    { id: 'G-13', name: 'Neha Tawde', jersey: 13, pos: 'Pole Diver', blood: 'B+' },
    { id: 'G-14', name: 'Madhuri Kadam', jersey: 14, pos: 'Running Chaser', blood: 'O+' },
    { id: 'G-15', name: 'Bhakti Nikam', jersey: 15, pos: 'All-Rounder', blood: 'A+' },
    { id: 'G-16', name: 'Divya Tambe', jersey: 16, pos: 'Defender', blood: 'B-' },
    { id: 'G-17', name: 'Radhika Pawar', jersey: 17, pos: 'Chaser', blood: 'O+' },
    { id: 'G-18', name: 'Gauri Salunkhe', jersey: 18, pos: 'Defender', blood: 'A+' },
  ];

  const createdGirlsPlayers = [];
  for (const p of girlsRosterData) {
    const username = p.id.toLowerCase().replace('-', '');
    const pass = await User.hashPassword(`${username}@KhoKho2026`);
    const playerUser = await User.create({
      username,
      passwordHash: pass,
      name: p.name,
      email: `${username}@arena.org`,
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
        email: `${username}@arena.org`,
        emergencyContactName: `Guardian of ${p.name}`,
        emergencyPhone: '+91 97100 88888',
      },
    });

    playerUser.playerRef = playerDoc._id;
    await playerUser.save();
    createdGirlsPlayers.push(playerDoc);
  }
  console.log(`[Seed] Created ${createdGirlsPlayers.length} Girls Players with active user accounts.`);

  // 5. Create Attendance Sessions over the past 2 weeks
  const sessionLabels = [
    'Morning Conditioning & Speed Drills',
    'Tactical Kho & Pole Turn Practice',
    'Defense 3-Batch Evasion Drills',
    'Match Simulation & Zigzag Running',
    'Agility & Stamina Circuit',
    'Tactical Video & Mat Footwork',
  ];

  const today = new Date();
  const generateSessionsForTeam = async (team, adminUser, players) => {
    for (let i = 12; i >= 0; i--) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - i);
      const dateStr = sessionDate.toISOString().slice(0, 10);
      const label = sessionLabels[i % sessionLabels.length];

      const session = await AttendanceSession.create({
        team,
        date: dateStr,
        sessionLabel: label,
        status: i === 0 ? 'DRAFT' : 'FINALIZED',
        recordedBy: adminUser._id,
        finalizedAt: i === 0 ? null : new Date(sessionDate),
      });

      let pres = 0;
      let abs = 0;
      let late = 0;
      let exc = 0;

      const records = [];
      players.forEach((player, idx) => {
        // Player attendance distribution: Top 15 players have >85% attendance, others vary
        let status = 'PRESENT';
        const rand = (idx * 7 + i * 13) % 100;

        if (idx < 15) {
          if (rand < 88) status = 'PRESENT';
          else if (rand < 94) status = 'LATE';
          else if (rand < 97) status = 'EXCUSED';
          else status = 'ABSENT';
        } else {
          if (rand < 65) status = 'PRESENT';
          else if (rand < 78) status = 'ABSENT';
          else if (rand < 88) status = 'LATE';
          else status = 'EXCUSED';
        }

        if (status === 'PRESENT') pres++;
        else if (status === 'ABSENT') abs++;
        else if (status === 'LATE') late++;
        else if (status === 'EXCUSED') exc++;

        records.push({
          session: session._id,
          player: player._id,
          team,
          date: dateStr,
          status,
          recordedBy: adminUser._id,
        });
      });

      await AttendanceRecord.insertMany(records);

      session.totalEligible = players.length;
      session.totalPresent = pres;
      session.totalAbsent = abs;
      session.totalLate = late;
      session.totalExcused = exc;
      await session.save();
    }
  };

  await generateSessionsForTeam('BOYS', boysAdmin, createdBoysPlayers);
  await generateSessionsForTeam('GIRLS', girlsAdmin, createdGirlsPlayers);
  console.log('[Seed] Populated historical attendance sessions and records.');

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
      author: superAdmin._id,
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
      title: 'Champions — All India Women’s Invitational Cup',
      year: 2025,
      event: 'South Zone Inter-Collegiate Women’s Sports Festival',
      result: 'Winners & Fair Play Trophy',
      description: 'Historic triumph by the Girls team with immaculate 3-batch defensive survival and tactical communication.',
      image: '/achievements/cit_champions_trophy.jpg',
      category: 'GIRLS',
    },
  ]);

  // 9. Create Gallery
  await GalleryItem.create([
    {
      title: 'High-Velocity Pole Turn Execution',
      caption: 'Active chaser executing a razor-sharp pole turn during the state semi-finals.',
      category: 'Action',
      team: 'BOYS',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Defensive 3-Batch Evasion Strategy',
      caption: 'Synchronized running defender weaving between sitting chasers.',
      category: 'Action',
      team: 'GIRLS',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Pre-Match Tactical Huddle',
      caption: 'Coach outlining chaser rotation and second-batch defending tactics.',
      category: 'Training',
      team: 'ALL',
      imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'National Trophy Presentation Ceremony',
      caption: 'Celebrating championship triumph at the AIU National Games.',
      category: 'Trophies',
      team: 'ALL',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    },
  ]);

  console.log('[Seed] Database seeding completed successfully.');
};

// If run directly via `npm run seed`
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kho-kho-arena')
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Fatal Error:', err);
      process.exit(1);
    });
}
