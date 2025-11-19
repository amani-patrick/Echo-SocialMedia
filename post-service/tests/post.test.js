require('dotenv').config();
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

let userId;
let token;
let postId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Simulate a user id (ObjectId). In production, obtain from user-service
  userId = new mongoose.Types.ObjectId();

  // Create JWT manually for tests
  token = jwt.sign({ userId: userId.toHexString(), username: 'testuser' }, process.env.JWT_SECRET);

  // Optionally truncate posts collection before starting tests
  await Post.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Post Endpoints', () => {
  it('should create a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello, world!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe('Hello, world!');
    postId = res.body._id;
  });

  it('should fail to create post with empty content', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should fetch all posts', async () => {
    const res = await request(app)
      .get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update own post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated content' });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('Updated content');
  });

  it('should fail to update someone else\'s post', async () => {
    const otherToken = jwt.sign({ userId: new mongoose.Types.ObjectId().toHexString(), username: 'otheruser' }, process.env.JWT_SECRET);
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Hacked!' });
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('should get posts for a user', async () => {
    const res = await request(app)
      .get(`/api/posts/user/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].author).toBe(userId.toHexString());
  });

  it('should delete a post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('should fail to delete non-existent post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});
