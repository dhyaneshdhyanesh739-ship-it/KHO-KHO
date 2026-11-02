import request from 'supertest';
import app from '../app.js';

async function runTests() {
  console.log('--- TESTING ADMIN CREDENTIALS ---');
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

  // Test 1: Boys Admin login with Vimal / Vimal@1234
  console.log('\n[Test 1] Boys Admin Login: Vimal / Vimal@1234');
  try {
    const res1 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Vimal', password: 'Vimal@1234', selectedTeam: 'BOYS', portalMode: 'ADMIN' });
    
    assert(res1.status === 200, `Status is 200 (got ${res1.status})`);
    assert(res1.body.success === true, 'Response body success is true');
    assert(res1.body.user?.role === 'BOYS_ADMIN', `User role is BOYS_ADMIN (got ${res1.body.user?.role})`);
    assert(res1.body.user?.team === 'BOYS', `User team is BOYS (got ${res1.body.user?.team})`);
    assert(Boolean(res1.body.token), 'Auth token generated');

    // Test token with /api/auth/me
    if (res1.body.token) {
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${res1.body.token}`);
      assert(meRes.status === 200, `/api/auth/me returns 200 for Vimal`);
      assert(meRes.body.user?.role === 'BOYS_ADMIN', `/api/auth/me returns role BOYS_ADMIN`);
    }
  } catch (err) {
    console.error('Test 1 error:', err.message);
    failed++;
  }

  // Test 2: Girls Admin login with Keerthana / keerthama@1234
  console.log('\n[Test 2] Girls Admin Login: Keerthana / keerthama@1234');
  try {
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Keerthana', password: 'keerthama@1234', selectedTeam: 'GIRLS', portalMode: 'ADMIN' });

    assert(res2.status === 200, `Status is 200 (got ${res2.status})`);
    assert(res2.body.success === true, 'Response body success is true');
    assert(res2.body.user?.role === 'GIRLS_ADMIN', `User role is GIRLS_ADMIN (got ${res2.body.user?.role})`);
    assert(res2.body.user?.team === 'GIRLS', `User team is GIRLS (got ${res2.body.user?.team})`);
    assert(Boolean(res2.body.token), 'Auth token generated');

    // Test token with /api/auth/me
    if (res2.body.token) {
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${res2.body.token}`);
      assert(meRes.status === 200, `/api/auth/me returns 200 for Keerthana`);
      assert(meRes.body.user?.role === 'GIRLS_ADMIN', `/api/auth/me returns role GIRLS_ADMIN`);
    }
  } catch (err) {
    console.error('Test 2 error:', err.message);
    failed++;
  }

  // Test 3: Case-insensitive login: vimal / Vimal@1234 and keerthana / keerthama@1234
  console.log('\n[Test 3] Lowercase username login');
  try {
    const res3a = await request(app)
      .post('/api/auth/login')
      .send({ username: 'vimal', password: 'Vimal@1234' });
    assert(res3a.status === 200 && res3a.body.user?.role === 'BOYS_ADMIN', 'vimal lowercase login succeeds as BOYS_ADMIN');

    const res3b = await request(app)
      .post('/api/auth/login')
      .send({ username: 'keerthana', password: 'keerthama@1234' });
    assert(res3b.status === 200 && res3b.body.user?.role === 'GIRLS_ADMIN', 'keerthana lowercase login succeeds as GIRLS_ADMIN');
  } catch (err) {
    console.error('Test 3 error:', err.message);
    failed++;
  }

  // Test 4: Invalid password rejected
  console.log('\n[Test 4] Invalid password rejection');
  try {
    const res4 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Vimal', password: 'wrongpassword' });
    assert(res4.status === 401, 'Vimal with wrong password rejected with 401');

    const res4b = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Keerthana', password: 'wrongpassword' });
    assert(res4b.status === 401, 'Keerthana with wrong password rejected with 401');
  } catch (err) {
    console.error('Test 4 error:', err.message);
    failed++;
  }

  console.log(`\n--- SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
