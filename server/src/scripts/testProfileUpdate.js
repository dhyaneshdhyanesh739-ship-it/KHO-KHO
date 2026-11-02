import request from 'supertest';
import app from '../app.js';

async function runProfileTests() {
  console.log('--- TESTING ATHLETE PROFILE UPDATE ENDPOINT ---');
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
    // 1. Log in as Boys Admin (Vimal) to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Vimal', password: 'Vimal@1234', selectedTeam: 'BOYS', portalMode: 'ADMIN' });

    assert(loginRes.status === 200, 'Login succeeded and returned 200');
    const token = loginRes.body.token;

    // 2. Call PUT /api/auth/profile with updated details and bio
    const profileRes = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Coach Vimal S.',
        aboutMe: 'Dedicated Kho-Kho coach and pole diver specialist with 8 years of competitive court experience.',
        signatureMove: 'Sky Dive',
        personalGoal: 'Win 2026 Inter-College State Championship',
        favoriteQuote: 'Speed in feet, fire in heart.',
        bloodGroup: 'O+',
        heightCm: 175,
        weightKg: 68,
        phone: '+91 98200 77777',
      });

    assert(profileRes.status === 200, `Profile update returned 200 (got ${profileRes.status})`);
    assert(profileRes.body.success === true, 'Success flag is true');
    assert(profileRes.body.user?.name === 'Coach Vimal S.', `User name updated to 'Coach Vimal S.'`);
    assert(Boolean(profileRes.body.token), 'Returned updated JWT token');

    // 3. Verify /api/auth/me returns the updated profile
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${profileRes.body.token}`);

    assert(meRes.status === 200, `/api/auth/me returned 200 with new token`);
    assert(meRes.body.user?.name === 'Coach Vimal S.', `Verified user name on /api/auth/me`);

    // 4. Test duplicate username validation
    const dupRes = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'superadmin', // Already taken
      });

    assert(dupRes.status === 400, 'Duplicate username rejected with 400 Bad Request');
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

runProfileTests();
