import request from 'supertest';
import app from '../app.js';

async function testOdLeaveFlow() {
  console.log('--- TESTING OD / LEAVE ATTENDANCE FUNCTIONALITY ---');
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
    // 1. Log in as Boys Admin (Vimal)
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'Vimal',
        password: 'Vimal@1234',
        selectedTeam: 'BOYS',
        portalMode: 'ADMIN',
      });

    assert(adminLogin.status === 200, `Admin logged in (status ${adminLogin.status})`);
    const adminToken = adminLogin.body.token;

    // 2. Create Attendance Session
    const testDate = '2026-11-02';
    const createSessionRes = await request(app)
      .post('/api/attendance/sessions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        date: testDate,
        sessionLabel: 'Inter-College OD Test Session',
        notes: 'Testing OD and Leave attendance marking',
      });

    assert(createSessionRes.status === 200 || createSessionRes.status === 201, `Session created/loaded (status ${createSessionRes.status})`);
    const session = createSessionRes.body.data;
    const sessionId = session._id || session.id;

    // 3. Mark Batch Attendance with OD and LEAVE
    const batchRes = await request(app)
      .post('/api/attendance/batch')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sessionId,
        finalize: false,
        records: [
          { playerId: 'B-01', status: 'PRESENT', notes: 'Present on ground' },
          { playerId: 'B-02', status: 'OD', notes: 'Official Sports OD - Varsity Trial' },
          { playerId: 'B-03', status: 'LEAVE', notes: 'Academic semester exam leave' },
          { playerId: 'B-04', status: 'ABSENT', notes: 'Unexcused absence' },
          { playerId: 'B-10', status: 'OD', notes: 'State Championship Duty' },
        ],
      });

    assert(batchRes.status === 200, `Batch attendance saved (status ${batchRes.status})`);
    const updatedSummary = batchRes.body.data?.summary || batchRes.body.data;

    // OD MUST BE COUNTED AS PRESENT:
    // B-01 (Present) + B-02 (OD) + B-10 (OD) = 3 total present!
    assert(updatedSummary.present === 3, `OD counted as Present in session: present = ${updatedSummary.present} (expected 3)`);
    assert(updatedSummary.absent === 1, `absent = ${updatedSummary.absent} (expected 1)`);
    assert(updatedSummary.excused === 1, `excused (including Leave) = ${updatedSummary.excused} (expected 1)`);

    // 4. Fetch Jelphin (B-02) Attendance (marked as OD)
    const odPlayerRes = await request(app)
      .get('/api/attendance/player/B-02')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(odPlayerRes.status === 200, `Player attendance retrieved for OD athlete`);
    const odSummary = odPlayerRes.body.data?.summary;
    assert(odSummary?.od >= 1, `OD count tracked: ${odSummary?.od}`);
    assert(odSummary?.present >= 1, `OD counted in total present: present = ${odSummary?.present}`);
    assert(odSummary?.absentDeduction === 0, `Zero deduction for OD player`);

    // 5. Fetch Vicky (B-03) Attendance (marked as LEAVE)
    const leavePlayerRes = await request(app)
      .get('/api/attendance/player/B-03')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(leavePlayerRes.status === 200, `Player attendance retrieved for Leave athlete`);
    const leaveSummary = leavePlayerRes.body.data?.summary;
    assert(leaveSummary?.leave >= 1 || leaveSummary?.excused >= 1, `Leave tracked in summary`);

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

testOdLeaveFlow();
