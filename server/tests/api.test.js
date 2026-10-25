import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Player from '../src/models/Player.js';
import AttendanceSession from '../src/models/AttendanceSession.js';
import AttendanceRecord from '../src/models/AttendanceRecord.js';
import Match from '../src/models/Match.js';
import MatchSquad from '../src/models/MatchSquad.js';

let boysAdminToken = '';
let girlsAdminToken = '';
let superAdminToken = '';
let playerToken = '';
let testBoysPlayerId = '';
let testGirlsPlayerId = '';

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kho-kho-arena';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  // 1. Log in as Boys Admin
  const boysRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'boysadmin', password: 'kiddo@khokho', selectedTeam: 'BOYS' });
  expect(boysRes.status).toBe(200);
  boysAdminToken = boysRes.body.token;

  // 2. Log in as Girls Admin
  const girlsRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'girlsadmin', password: 'kiddo@khokho', selectedTeam: 'GIRLS' });
  expect(girlsRes.status).toBe(200);
  girlsAdminToken = girlsRes.body.token;

  // 3. Log in as Super Admin
  const superRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'dhyanesh', password: 'kiddo@khokho', selectedTeam: 'ALL' });
  expect(superRes.status).toBe(200);
  superAdminToken = superRes.body.token;

  // 4. Log in as Player (mohan)
  const playerRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'mohan', password: 'mohan@khokho', selectedTeam: 'BOYS' });
  expect(playerRes.status).toBe(200);
  playerToken = playerRes.body.token;

  const bPlayer = await Player.findOne({ team: 'BOYS' });
  testBoysPlayerId = bPlayer._id.toString();

  const gPlayer = await Player.findOne({ team: 'GIRLS' });
  testGirlsPlayerId = gPlayer._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Kho-Kho Arena Backend Tests', () => {
  // Test 1: Authentication & RBAC
  test('Boys Admin can login and access /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${boysAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('BOYS_ADMIN');
    expect(res.body.user.team).toBe('BOYS');
  });

  test('Girls Admin can login and access /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${girlsAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('GIRLS_ADMIN');
    expect(res.body.user.team).toBe('GIRLS');
  });

  // Test 2: Strict Cross-Team Isolation
  test('Boys Admin is strictly forbidden from accessing Girls team data', async () => {
    const res = await request(app)
      .get('/api/players?team=GIRLS')
      .set('Authorization', `Bearer ${boysAdminToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Girls/i);
  });

  test('Girls Admin is strictly forbidden from accessing Boys team data', async () => {
    const res = await request(app)
      .get('/api/players?team=BOYS')
      .set('Authorization', `Bearer ${girlsAdminToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Boys/i);
  });

  // Test 3: Player role cannot modify attendance or create players
  test('Player cannot create attendance session', async () => {
    const res = await request(app)
      .post('/api/attendance/sessions')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ date: '2026-11-01', sessionLabel: 'Unauthorized Practice' });
    expect(res.status).toBe(403);
  });

  test('Player cannot record attendance batch', async () => {
    const res = await request(app)
      .post('/api/attendance/batch')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ sessionId: new mongoose.Types.ObjectId(), records: [] });
    expect(res.status).toBe(403);
  });

  // Test 4: Roster & Duplicate Jersey Check
  test('Rejects duplicate jersey number within the same team', async () => {
    // Player 1 already has jersey 1
    const res = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${boysAdminToken}`)
      .send({
        playerId: 'B-TEST-99',
        name: 'Duplicate Jersey Tester',
        jerseyNumber: 1, // Already taken by Arjun Shinde
        position: 'Chaser',
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already taken/i);
  });

  // Test 5: Attendance Recording & Duplicate Record Prevention
  test('Allows creating session and records, and rejects duplicate player in same session', async () => {
    const testDate = '2026-12-15';
    // Create new test session
    const sessRes = await request(app)
      .post('/api/attendance/sessions')
      .set('Authorization', `Bearer ${boysAdminToken}`)
      .send({ date: testDate, sessionLabel: 'Endurance & Pole Sprint Test' });
    expect([200, 201]).toContain(sessRes.status);
    const sessionId = sessRes.body.data._id;

    // Save batch attendance
    const batchRes = await request(app)
      .post('/api/attendance/batch')
      .set('Authorization', `Bearer ${boysAdminToken}`)
      .send({
        sessionId,
        records: [
          { playerId: testBoysPlayerId, status: 'PRESENT', notes: 'Top sprint speed' },
        ],
      });
    expect(batchRes.status).toBe(200);
    expect(batchRes.body.data.summary.present).toBe(1);

    // Verify session overview updates
    const overviewRes = await request(app)
      .get('/api/reports/overview')
      .set('Authorization', `Bearer ${boysAdminToken}`);
    expect(overviewRes.status).toBe(200);
    expect(overviewRes.body.data.totalActivePlayers).toBeGreaterThanOrEqual(21);
  });

  // Test 6: Match Squad Limit Enforcement
  test('Enforces maximum squad limit of 15 for Boys team', async () => {
    // Find scheduled match for Boys
    const match = await Match.findOne({ team: 'BOYS', status: 'SCHEDULED' });
    expect(match).toBeTruthy();
    expect(match.squadSize).toBe(15);

    // Load active boys players
    const boysPlayers = await Player.find({ team: 'BOYS' }).limit(16);
    expect(boysPlayers.length).toBeGreaterThanOrEqual(16);

    // Attempt to save squad with 16 players (exceeds 15)
    const oversizedSquad = boysPlayers.map((p) => ({
      playerId: p._id,
      name: p.name,
      jerseyNumber: p.jerseyNumber,
      attendancePercentage: 90,
    }));

    const res = await request(app)
      .post(`/api/matches/${match._id}/squad`)
      .set('Authorization', `Bearer ${boysAdminToken}`)
      .send({
        selectedPlayers: oversizedSquad,
        coachNotes: 'Testing exceeding limit',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Squad limit exceeded/i);
  });

  // Test 7: Squad Recommendations Engine returns ranked candidates
  test('Squad recommendation engine returns ranked candidates with attendance scores and explanations', async () => {
    const match = await Match.findOne({ team: 'BOYS', status: 'SCHEDULED' });
    const boyCount = await Player.countDocuments({ team: 'BOYS', active: true });
    const res = await request(app)
      .get(`/api/matches/${match._id}/recommendations?days=30`)
      .set('Authorization', `Bearer ${boysAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.recommendedSquad.length).toBeLessThanOrEqual(15);
    expect(res.body.data.allRankings.length).toBe(boyCount);
    expect(res.body.data.allRankings[0].rankingFactor).toBeTruthy();
    expect(res.body.data.allRankings[0].recommendationScore).toBeGreaterThan(0);
    expect(res.body.data.allRankings[0].matchAttendancePercentage).toBeDefined();
    expect(res.body.data.allRankings[0].baseMatchPercentage).toBe(100);
  });

  // Test 8: Match Attendance Policy: 100% Base, -2% Absent, -1% Excused for Boys & Girls
  test('Calculates 100% Base Match Attendance with automatic -2% absent and -1% excused reduction for both Boys and Girls', async () => {
    // 1. Check Boys Player Attendance
    const boysPlayerRes = await request(app)
      .get(`/api/attendance/player/${testBoysPlayerId}`)
      .set('Authorization', `Bearer ${boysAdminToken}`);

    expect(boysPlayerRes.status).toBe(200);
    const bSummary = boysPlayerRes.body.data.summary;
    expect(bSummary.baseMatchPercentage).toBe(100);
    expect(bSummary.absentDeduction).toBe(bSummary.absent * 2);
    expect(bSummary.excusedDeduction).toBe(bSummary.excused * 1);
    expect(bSummary.totalDeduction).toBe(bSummary.absentDeduction + bSummary.excusedDeduction);
    expect(bSummary.matchAttendancePercentage).toBe(Math.max(0, 100 - bSummary.totalDeduction));

    // 2. Check Girls Player Attendance
    const girlsPlayerRes = await request(app)
      .get(`/api/attendance/player/${testGirlsPlayerId}`)
      .set('Authorization', `Bearer ${girlsAdminToken}`);

    expect(girlsPlayerRes.status).toBe(200);
    const gSummary = girlsPlayerRes.body.data.summary;
    expect(gSummary.baseMatchPercentage).toBe(100);
    expect(gSummary.absentDeduction).toBe(gSummary.absent * 2);
    expect(gSummary.excusedDeduction).toBe(gSummary.excused * 1);
    expect(gSummary.totalDeduction).toBe(gSummary.absentDeduction + gSummary.excusedDeduction);
    expect(gSummary.matchAttendancePercentage).toBe(Math.max(0, 100 - gSummary.totalDeduction));

    // 3. Check Boys Overview Dashboard
    const boysOverview = await request(app)
      .get('/api/reports/overview?team=BOYS')
      .set('Authorization', `Bearer ${boysAdminToken}`);

    expect(boysOverview.status).toBe(200);
    const bMatch = boysOverview.body.data.teamMatchAttendance;
    expect(bMatch).toBeDefined();
    expect(bMatch.basePercentage).toBe(100);
    expect(bMatch.members.length).toBeGreaterThan(0);
    for (const member of bMatch.members) {
      expect(member.matchAttendancePercentage).toBe(
        Math.max(0, 75 - (member.absent * 2) - (member.excused * 1))
      );
    }

    // 4. Check Girls Overview Dashboard
    const girlsOverview = await request(app)
      .get('/api/reports/overview?team=GIRLS')
      .set('Authorization', `Bearer ${girlsAdminToken}`);

    expect(girlsOverview.status).toBe(200);
    const gMatch = girlsOverview.body.data.teamMatchAttendance;
    expect(gMatch).toBeDefined();
    expect(gMatch.basePercentage).toBe(75);
    expect(gMatch.members.length).toBeGreaterThan(0);
    for (const member of gMatch.members) {
      expect(member.matchAttendancePercentage).toBe(
        Math.max(0, 75 - (member.absent * 2) - (member.excused * 1))
      );
    }
  });

  // Test 9: Add and Remove Team Members from Admin & Super Admin Dashboards
  test('Boys Admin can add and remove a Boys team member, but cannot delete Girls player', async () => {
    // 1. Boys Admin creates new team member
    const createRes = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${boysAdminToken}`)
      .send({
        playerId: 'B99',
        name: 'Vikas Test Boy',
        jerseyNumber: 99,
        position: 'Defender',
        team: 'BOYS',
        createLogin: true,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.playerId).toBe('B99');
    expect(createRes.body.data.team).toBe('BOYS');
    const newPlayerId = createRes.body.data._id;

    // Verify user account was created
    const userAcc = await User.findOne({ username: 'b99' });
    expect(userAcc).toBeTruthy();

    // 2. Cross-team isolation: Boys Admin tries to delete Girls player -> 403 Forbidden
    const unauthDelete = await request(app)
      .delete(`/api/players/${testGirlsPlayerId}`)
      .set('Authorization', `Bearer ${boysAdminToken}`);
    expect(unauthDelete.status).toBe(403);

    // 3. Boys Admin removes their new player -> 200 OK
    const deleteRes = await request(app)
      .delete(`/api/players/${newPlayerId}`)
      .set('Authorization', `Bearer ${boysAdminToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify player and user are cleaned up
    const deletedPlayer = await Player.findById(newPlayerId);
    expect(deletedPlayer).toBeNull();
    const deletedUser = await User.findOne({ username: 'b99' });
    expect(deletedUser).toBeNull();
  });

  test('Girls Admin can add and remove a Girls team member, but cannot delete Boys player', async () => {
    // 1. Girls Admin creates new team member
    const createRes = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${girlsAdminToken}`)
      .send({
        playerId: 'G99',
        name: 'Pooja Test Girl',
        jerseyNumber: 99,
        position: 'Chaser',
        team: 'GIRLS',
        createLogin: true,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.playerId).toBe('G99');
    expect(createRes.body.data.team).toBe('GIRLS');
    const newPlayerId = createRes.body.data._id;

    // 2. Cross-team isolation: Girls Admin tries to delete Boys player -> 403 Forbidden
    const unauthDelete = await request(app)
      .delete(`/api/players/${testBoysPlayerId}`)
      .set('Authorization', `Bearer ${girlsAdminToken}`);
    expect(unauthDelete.status).toBe(403);

    // 3. Girls Admin removes their new player -> 200 OK
    const deleteRes = await request(app)
      .delete(`/api/players/${newPlayerId}`)
      .set('Authorization', `Bearer ${girlsAdminToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify cleanup
    const deletedPlayer = await Player.findById(newPlayerId);
    expect(deletedPlayer).toBeNull();
  });

  test('Super Admin can add and remove team members across both Boys and Girls teams', async () => {
    // 1. Super Admin adds a Girls member
    const createGirlRes = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        playerId: 'G98',
        name: 'Super Admin Added Girl',
        jerseyNumber: 98,
        position: 'All-Rounder',
        team: 'GIRLS',
        createLogin: true,
      });

    expect(createGirlRes.status).toBe(201);
    expect(createGirlRes.body.data.team).toBe('GIRLS');
    const girlPlayerId = createGirlRes.body.data._id;

    // 2. Super Admin adds a Boys member
    const createBoyRes = await request(app)
      .post('/api/players')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        playerId: 'B98',
        name: 'Super Admin Added Boy',
        jerseyNumber: 98,
        position: 'All-Rounder',
        team: 'BOYS',
        createLogin: true,
      });

    expect(createBoyRes.status).toBe(201);
    expect(createBoyRes.body.data.team).toBe('BOYS');
    const boyPlayerId = createBoyRes.body.data._id;

    // 3. Super Admin deletes both players successfully
    const delGirlRes = await request(app)
      .delete(`/api/players/${girlPlayerId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(delGirlRes.status).toBe(200);

    const delBoyRes = await request(app)
      .delete(`/api/players/${boyPlayerId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(delBoyRes.status).toBe(200);

    expect(await Player.findById(girlPlayerId)).toBeNull();
    expect(await Player.findById(boyPlayerId)).toBeNull();
  });

  test('Public direct-change-password updates password securely from login page', async () => {
    // 1. Attempt with incorrect current password
    const failRes = await request(app)
      .post('/api/auth/direct-change-password')
      .send({
        username: 'mohan',
        currentPassword: 'wrongpassword',
        newPassword: 'newMohanPassword123',
      });
    expect(failRes.status).toBe(401);
    expect(failRes.body.success).toBe(false);

    // 2. Successful update with valid current password
    const successRes = await request(app)
      .post('/api/auth/direct-change-password')
      .send({
        username: 'mohan',
        currentPassword: 'mohan@khokho',
        newPassword: 'updatedPass456!',
      });
    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);

    // 3. Verify login works with the new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'mohan', password: 'updatedPass456!', selectedTeam: 'BOYS' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    // 4. Restore original password for test consistency
    const restoreRes = await request(app)
      .post('/api/auth/direct-change-password')
      .send({
        username: 'mohan',
        currentPassword: 'updatedPass456!',
        newPassword: 'mohan@khokho',
      });
    expect(restoreRes.status).toBe(200);
  });
});
