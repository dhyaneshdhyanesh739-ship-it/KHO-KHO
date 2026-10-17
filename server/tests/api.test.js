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
    .send({ username: 'boysadmin', password: 'BoysAdmin@KhoKho2026!', selectedTeam: 'BOYS' });
  expect(boysRes.status).toBe(200);
  boysAdminToken = boysRes.body.token;

  // 2. Log in as Girls Admin
  const girlsRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'girlsadmin', password: 'GirlsAdmin@KhoKho2026!', selectedTeam: 'GIRLS' });
  expect(girlsRes.status).toBe(200);
  girlsAdminToken = girlsRes.body.token;

  // 3. Log in as Player (b01)
  const playerRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'b01', password: 'b01@KhoKho2026', selectedTeam: 'BOYS' });
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
    expect(sessRes.status).toBe(201);
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
    expect(overviewRes.body.data.totalActivePlayers).toBe(23); // Exactly 23 Boys players!
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
    const res = await request(app)
      .get(`/api/matches/${match._id}/recommendations?days=30`)
      .set('Authorization', `Bearer ${boysAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.recommendedSquad.length).toBeLessThanOrEqual(15);
    expect(res.body.data.allRankings.length).toBe(23);
    expect(res.body.data.allRankings[0].rankingFactor).toBeTruthy();
    expect(res.body.data.allRankings[0].recommendationScore).toBeGreaterThan(0);
  });
});
