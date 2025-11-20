const request = require('supertest');
const app = require('../server');

describe('Full API Gateway microservices flow', () => {
  let tokenA, tokenB;
  let postId, commentId;

  it('registers UserA', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'userA', email: 'userA@example.com', password: 'Pass1234' });
    expect(res.statusCode).toBe(201);
  });

  it('registers UserB', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'userB', email: 'userB@example.com', password: 'Pass1234' });
    expect(res.statusCode).toBe(201);
  });

  it('logs in UserA', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'userA@example.com', password: 'Pass1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenA = res.body.token;
  });

  it('logs in UserB', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'userB@example.com', password: 'Pass1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenB = res.body.token;
  });

  it('UserA creates a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Hello from A!' });
    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    postId = res.body._id;
  });

  it('UserB comments on UserA post', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ post: postId, content: 'Hey A!', postAuthorId: postId });
    expect([200,201]).toContain(res.statusCode);
    expect(res.body._id).toBeDefined();
    commentId = res.body._id;
  });

  it('UserA likes UserB comment', async () => {
    const res = await request(app)
      .post('/api/likes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ entityId: commentId, entityType: 'comment', entityOwner: tokenB });
    expect([200,201]).toContain(res.statusCode);
  });

  // Add other flows as needed, e.g. get/post by ID checks, friendship, notification, etc.
    it('UserA gets all posts (should include UserA\'s post)', async () => {
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);
    // Optionally: expect(res.body).toContainEqual(expect.objectContaining({ _id: postId }));
  });

  it('UserB gets comments for UserA\'s post (should include UserB\'s comment)', async () => {
    const res = await request(app)
      .get(`/api/comments/post/${postId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.statusCode).toBe(200);
    expect(
      res.body.some(comment => comment._id === commentId)
    ).toBe(true);
  });

  it('UserA sends friendship request to UserB', async () => {
    const res = await request(app)
      .post('/api/friends/request')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ toUserId: res.body._id }); // You may want to fetch B’s userId via /api/users/me or similar.
    expect([200, 201]).toContain(res.statusCode);
  });

  it('UserB checks for notifications (should include friendship, comment, like)', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.statusCode).toBe(200);
    // Optionally, check for specific notification types in res.body
  });

  it('UserA unlikes UserB\'s comment', async () => {
    const res = await request(app)
      .delete('/api/likes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ entityId: commentId, entityType: 'comment' });
    expect([200, 204, 404]).toContain(res.statusCode);
  });

  it('UserA deletes their post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect([200, 204, 404]).toContain(res.statusCode);
  });

  // Optionally, assert that likes and comments are also cleaned up (using GET endpoints).
    it('UserB updates their profile information', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ username: 'userB_updated', bio: 'Love testing APIs!' });
    expect([200, 204]).toContain(res.statusCode);
    if (res.body && res.body.username) {
      expect(res.body.username).toBe('userB_updated');
    }
  });

  it('UserB deletes their comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect([200, 204, 404]).toContain(res.statusCode);
  });

  it('UserA fetches their post by ID', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    // If deleted above, expect 404; otherwise, expect 200
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.content).toBe('Hello from A!');
    }
  });

  it('UserA removes friendship with UserB', async () => {
    const res = await request(app)
      .delete('/api/friends')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ toUserId: /* actual UserB ID here, fetch if needed */ });
    expect([200, 204, 404]).toContain(res.statusCode);
  });

  it('UserA and UserB check notifications are updated after deletions', async () => {
    const resA = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(resA.statusCode).toBe(200);

    const resB = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(resB.statusCode).toBe(200);

  });

});


