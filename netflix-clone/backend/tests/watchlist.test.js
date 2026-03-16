const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
  
  token = registerRes.body.token;
  userId = registerRes.body.user.id;
});

describe('Watchlist', () => {
  test('GET /api/watchlist should return empty watchlist', async () => {
    const response = await request(app)
      .get('/api/watchlist')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.watchlist).toEqual([]);
  });

  test('POST /api/watchlist should add movie', async () => {
    const response = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: 550,
        title: 'Fight Club',
        posterPath: '/poster.jpg'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.watchlist).toHaveLength(1);
    expect(response.body.watchlist[0].movieId).toBe(550);
  });

  test('POST /api/watchlist should reject duplicate movie', async () => {
    await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: 550,
        title: 'Fight Club',
        posterPath: '/poster.jpg'
      });

    const response = await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: 550,
        title: 'Fight Club',
        posterPath: '/poster.jpg'
      });
    
    expect(response.status).toBe(400);
  });

  test('DELETE /api/watchlist/:movieId should remove movie', async () => {
    await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: 550,
        title: 'Fight Club',
        posterPath: '/poster.jpg'
      });

    const response = await request(app)
      .delete('/api/watchlist/550')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.watchlist).toHaveLength(0);
  });

  test('GET /api/watchlist/check/:movieId should check if in watchlist', async () => {
    await request(app)
      .post('/api/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: 550,
        title: 'Fight Club',
        posterPath: '/poster.jpg'
      });

    const response = await request(app)
      .get('/api/watchlist/check/550')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.inWatchlist).toBe(true);
  });

  test('Watchlist endpoints should require authentication', async () => {
    const response = await request(app).get('/api/watchlist');
    expect(response.status).toBe(401);
  });
});
