/**
 * API integration tests for MoMech
 */

const request = require('supertest');
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.DB_PATH = path.join(__dirname, '../../database/test-momech.db');
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';

const testDbPath = process.env.DB_PATH;

beforeAll(async () => {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  const Server = require('../../server/index');
  const server = new Server();
  await server.start();
  global.testApp = server.app;
  global.testServer = server;
});

afterAll(async () => {
  if (global.testServer) {
    await global.testServer.stop();
  }
  const dbConnection = require('../../server/database/connection');
  await dbConnection.close();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  const walPath = testDbPath + '-wal';
  const shmPath = testDbPath + '-shm';
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
});

describe('Health Check', () => {
  it('GET /health returns healthy status', async () => {
    const res = await request(global.testApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.version).toBe('1.0.0');
  });
});

describe('Clients API', () => {
  it('GET /api/v1/clients returns paginated clients', async () => {
    const res = await request(global.testApp).get('/api/v1/clients?limit=5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clients');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.clients)).toBe(true);
    expect(res.body.clients.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/clients/search returns results for valid query', async () => {
    const res = await request(global.testApp).get('/api/v1/clients/search?q=John');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/v1/clients/search is not treated as an ID', async () => {
    const res = await request(global.testApp).get('/api/v1/clients/search?q=Smith');
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty('error');
  });
});

describe('Appointments API', () => {
  it('GET /api/v1/appointments/today returns an array', async () => {
    const res = await request(global.testApp).get('/api/v1/appointments/today');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Dashboard API', () => {
  it('GET /api/v1/dashboard/stats returns statistics', async () => {
    const res = await request(global.testApp).get('/api/v1/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('activeClients');
    expect(res.body).toHaveProperty('monthlyRevenue');
    expect(res.body).toHaveProperty('upcomingAppointments');
  });
});

describe('Auth API', () => {
  it('POST /api/v1/auth/register is disabled by default', async () => {
    const res = await request(global.testApp)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).toBe(403);
  });
});
