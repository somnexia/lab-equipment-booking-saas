'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');

const PASSWORD = 'Password123!';

async function login(email) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: PASSWORD });

  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return res.headers['set-cookie'];
}

describe('TC-S security', () => {
  test('TC-S-01: GET /api/bookings without cookie returns 401', async () => {
    const res = await request(app).get('/api/bookings');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  test('TC-S-02: GET /api/equipment without cookie returns 401', async () => {
    const res = await request(app).get('/api/equipment');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  test('TC-S-03: invalid JWT returns 401', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', 'Bearer not-a-valid-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  test('TC-S-04: technician POST /api/bookings returns 403', async () => {
    const token = jwt.sign(
      {
        id: 3,
        email: 'manager@chem.lab.local',
        role: 'technician',
        organization_id: 1,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipment_id: 1,
        start_time: '2026-12-01 10:00:00',
        end_time: '2026-12-01 12:00:00',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  test('TC-S-05: student POST /api/equipment returns 403', async () => {
    const cookie = await login('student@chem.lab.local');

    const res = await request(app)
      .post('/api/equipment')
      .set('Cookie', cookie)
      .send({
        name: 'Should not be created',
        organization_id: 1,
        category_id: 1,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });

  test('TC-S-06: student cannot cancel another user booking', async () => {
    const cookie = await login('student@chem.lab.local');

    // seed: booking 1 belongs to researcher (user_id = 4), not the student
    const res = await request(app)
      .patch('/api/bookings/1/cancel')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
  });

  test('TC-S-07: lab_admin cannot read another organization', async () => {
    const cookie = await login('lab.admin@chem.lab.local');

    const list = await request(app)
      .get('/api/organizations')
      .set('Cookie', cookie);

    expect(list.status).toBe(200);
    expect(list.body.every((org) => org.id === 1)).toBe(true);
    expect(list.body.some((org) => org.id === 2)).toBe(false);

    const foreign = await request(app)
      .get('/api/organizations/2')
      .set('Cookie', cookie);

    expect(foreign.status).toBe(403);
  });

  test('TC-S-08: student cannot list all users', async () => {
    const cookie = await login('student@chem.lab.local');

    const res = await request(app)
      .get('/api/users')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden');
  });
});
