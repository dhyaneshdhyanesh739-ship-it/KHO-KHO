import request from 'supertest';
import app from '../app.js';

async function testPlayerFlow() {
  console.log('--- TESTING PLAYER DASHBOARD & PROFILE FLOW ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  };

  try {
    // 1. Boys Player Login (s.e.d)
    const boysLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 's.e.d',
        password: 's.e.d@khokho',
        selectedTeam: 'BOYS',
        portalMode: 'TEAM',
      });

    assert(boysLogin.status === 200, `Boys Player s.e.d logged in successfully (status ${boysLogin.status})`);
    assert(boysLogin.body.user?.role === 'PLAYER', 'User role is PLAYER');
    assert(boysLogin.body.user?.team === 'BOYS', 'User team is BOYS');
    const boysToken = boysLogin.body.token;

    // 2. Boys Profile Update
    const boysUpdate = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${boysToken}`)
      .send({
        username: 'sed.speed',
        name: 'S.E.D - Lightning Chaser',
        aboutMe: 'Passionate Kho-Kho pole diver and all-rounder representing the Boys Varsity squad.',
        signatureMove: 'Sky Dive',
        personalGoal: 'Score 15+ touches in tournament matches.',
        favoriteQuote: 'Swift as lightning, steady as stone.',
        bloodGroup: 'B+',
        heightCm: 178,
        weightKg: 69,
        phone: '+91 98400 99999',
      });

    assert(boysUpdate.status === 200, `Boys profile updated (status ${boysUpdate.status})`);
    assert(boysUpdate.body.user?.username === 'sed.speed', `Username updated to 'sed.speed'`);
    assert(boysUpdate.body.user?.name === 'S.E.D - Lightning Chaser', `Name updated`);

    // 3. Girls Player Login (ananya)
    const girlsLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'ananya',
        password: 'ananya@khokho',
        selectedTeam: 'GIRLS',
        portalMode: 'TEAM',
      });

    assert(girlsLogin.status === 200, `Girls Player ananya logged in successfully (status ${girlsLogin.status})`);
    assert(girlsLogin.body.user?.role === 'PLAYER', 'Girls user role is PLAYER');
    assert(girlsLogin.body.user?.team === 'GIRLS', 'Girls user team is GIRLS');
    const girlsToken = girlsLogin.body.token;

    // 4. Girls Profile Update
    const girlsUpdate = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${girlsToken}`)
      .send({
        username: 'ananya.defense',
        name: 'Ananya (Defender)',
        aboutMe: 'Chain running specialist and defensive backbone of the Girls Kho-Kho team.',
        signatureMove: 'Chain Running',
        personalGoal: 'Achieve zero fouls across state tournament.',
        favoriteQuote: 'Defense wins championships.',
        bloodGroup: 'O+',
        heightCm: 165,
        weightKg: 55,
      });

    assert(girlsUpdate.status === 200, `Girls profile updated (status ${girlsUpdate.status})`);
    assert(girlsUpdate.body.user?.username === 'ananya.defense', `Girls username updated to 'ananya.defense'`);

    // 5. Verify /api/auth/me returns new profile with new token
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${girlsUpdate.body.token}`);

    assert(meRes.status === 200, `/api/auth/me succeeded`);
    assert(meRes.body.user?.username === 'ananya.defense', 'Username persisted in session');
  } catch (err) {
    console.error('Test error:', err.message);
    failed++;
  }

  console.log(`\n--- SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testPlayerFlow();
