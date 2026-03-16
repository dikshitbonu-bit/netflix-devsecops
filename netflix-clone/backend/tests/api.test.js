const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  test('GET /health should return healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  test('GET /api/movies/popular should return movies', async () => {
    const response = await request(app).get('/api/movies/popular');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
  });

  test('GET /api/movies/search should require query param', async () => {
    const response = await request(app).get('/api/movies/search');
    expect(response.status).toBe(400);
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});
