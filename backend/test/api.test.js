const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../app');

async function login() {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'Anitha',
      password: 'Grassroots@123'
    });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  return response.body.token;
}

test('auth login returns a token and user payload', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'Anitha',
      password: 'Grassroots@123'
    });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);
  assert.equal(response.body.user.name, 'Anitha');
});

test('authenticated me endpoint returns the active user', async () => {
  const token = await login();
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.name, 'Anitha');
});

test('authenticated leads endpoint returns lead data', async () => {
  const token = await login();
  const response = await request(app)
    .get('/api/leads')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('authenticated clients endpoint returns client data', async () => {
  const token = await login();
  const response = await request(app)
    .get('/api/clients')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
});

test('authenticated reports summary endpoint returns selected range and ytd', async () => {
  const token = await login();
  const response = await request(app)
    .get('/api/reports/summary?from=2026-04-01&to=2026-04-30')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.ok(response.body.selectedRange);
  assert.ok(response.body.ytd);
});


