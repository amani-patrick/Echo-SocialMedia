require('dotenv').config();
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

let userId;
let token;
let postId;
let otherToken;
const attachmentPath = path.join(__dirname, 'sample-image.png'); // Create a dummy image file for test!

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  userId = new mongoose.Types.ObjectId();
  otherToken = jwt.sign({ userId: new mongoose.Types.ObjectId().toHexString(), username: 'otheruser' }, process.env.JWT_SECRET);
  token = jwt.sign({ userId: userId.toHexString(), username: 'testuser' }, process.env.JWT_SECRET);

  await Post.deleteMany({});
  // Create dummy file for attachment upload
  fs.writeFileSync(attachmentPath, Buffer.from([0x89, 0x50, 0x4E, 0x47])); // PNG header
});

afterAll(async () => {
  if (fs.existsSync(attachmentPath)) fs.unlinkSync(attachmentPath);
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Post Endpoints', () => {
  it('should create a post with advanced fields', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Advanced Hello',
        attachments: [{ url: '/uploads/sample-image.png', type: 'image' }],
        tags: ['dev', 'test'],
        privacy: 'friends'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe('Advanced Hello');
    expect(Array.isArray(res.body.attachments)).toBe(true);
    if (res.body.attachments.length > 0) {
      expect(res.body.attachments[0].type).toBe('image');
    }
    expect(Array.isArray(res.body.tags)).toBe(true);
    expect(res.body.tags).toContain('dev');
    expect(res.body.privacy).toBe('friends');
    expect(res.body._id).toBeDefined();
    postId = res.body._id;
  });

  it('should upload an attachment', async () => {
    const res = await request(app)
      .post('/api/posts/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('attachment', attachmentPath);
    expect([201, 200]).toContain(res.statusCode); // Accept 201 or 200
    expect(res.body.url).toMatch(/uploads/);
    expect(['image', 'file']).toContain(res.body.type);
  });

  it('should fail to create post with empty content', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should fetch all posts (integration enrichment)', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].author).toHaveProperty('username');
    expect(res.body[0].author).toHaveProperty('avatar');
  });

  it('should update own post with reactions/tags', async () => {
    expect(postId).toBeDefined();
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated content', tags: ['feature'], privacy: 'public' });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('Updated content');
    expect(Array.isArray(res.body.tags)).toBe(true);
    expect(res.body.tags).toContain('feature');
    expect(res.body.privacy).toBe('public');
  });

  it('should fail to update someone else\'s post', async () => {
    expect(postId).toBeDefined();
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Hacked!' });
    expect([404, 403, 400, 500]).toContain(res.statusCode); // Accept error status
    if (res.body.error) {
      expect(res.body.error).toMatch(/not authorized|not found/i);
    }
  });

  it('should add and update a reaction', async () => {
    expect(postId).toBeDefined();
    let res = await request(app)
      .post(`/api/posts/${postId}/reaction`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'like' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find(r => r.type === 'like')).toBeDefined();

    res = await request(app)
      .post(`/api/posts/${postId}/reaction`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'love' });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find(r => r.type === 'love')).toBeDefined();
  });

  it('should get posts for a user', async () => {
    const res = await request(app)
      .get(`/api/posts/user/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].author).toBe(userId.toHexString());
  });

  it('should delete a post', async () => {
    expect(postId).toBeDefined();
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(res.statusCode);
    if (res.body.message) expect(res.body.message).toMatch(/deleted/i);
  });

  it('should fail to delete non-existent post', async () => {
    expect(postId).toBeDefined();
    const res = await request(app)
      .delete(`/api/posts/${postId}`) // Already deleted above
      .set('Authorization', `Bearer ${token}`);
    expect([404, 400, 500]).toContain(res.statusCode); // Accept error status
    if (res.body.error) expect(res.body.error).toMatch(/not found/i);
  });
});
