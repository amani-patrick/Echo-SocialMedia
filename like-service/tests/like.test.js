require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const Like = require('../models/like');
const jwt = require('jsonwebtoken');
const app = require('../server');

let token, otherToken, userId, otherUserId, postId, likeId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  userId = new mongoose.Types.ObjectId();
  otherUserId = new mongoose.Types.ObjectId();
  token = jwt.sign({ userId: userId.toHexString(), username: 'alice' }, process.env.JWT_SECRET);
  otherToken = jwt.sign({ userId: otherUserId.toHexString(), username: 'bob' }, process.env.JWT_SECRET);
  postId = new mongoose.Types.ObjectId();
  await Like.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Like Service', () => {
  it('should like a post', async () => {
    const res = await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ entityId: postId.toHexString(), entityType: 'post', entityOwner: otherUserId.toHexString() });
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBe(userId.toHexString());
    likeId = res.body._id;
  });

  it('should not like the same post twice', async () => {
    const res = await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ entityId: postId.toHexString(), entityType: 'post', entityOwner: otherUserId.toHexString() });
    expect([409, 201]).toContain(res.statusCode);
  });

  it('should get likes for the post', async () => {
    const res = await request(app)
      .get(`/api/likes/entity/post/${postId.toHexString()}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].user).toBe(userId.toHexString());
  });

  it('should unlike the post', async () => {
    const res = await request(app)
      .delete('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ entityId: postId.toHexString(), entityType: 'post' });
    expect([200, 204]).toContain(res.statusCode);
    if (res.body.message) expect(res.body.message).toMatch(/unliked/i);
  });

  it('should not unlike a post not liked before', async () => {
    const res = await request(app)
      .delete('/api/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ entityId: postId.toHexString(), entityType: 'post' });
    expect([404, 400]).toContain(res.statusCode);
  });
});
