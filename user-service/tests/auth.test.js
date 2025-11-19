const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
require('dotenv').config();


beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI.replace('userdb', 'userdb_test'));
});
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@mail.com', password: 'testpass1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully.');
  });

  it('should not register duplicate user', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@mail.com', password: 'testpass1' });
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', email: 'test@mail.com', password: 'testpass1' });
    expect(res.statusCode).toBe(400);
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ usernameOrEmail: 'testuser', password: 'testpass1' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
