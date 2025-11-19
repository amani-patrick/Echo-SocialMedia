require('dotenv').config();
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/user');

let token;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    // Register and log in a test user to get JWT
    await request(app).post('/api/users/register').send({
        username: 'testprofile',
        email: 'testprofile@mail.com',
        password: 'testpass1'
    });
    const res = await request(app).post('/api/users/login').send({
        usernameOrEmail: 'testprofile',
        password: 'testpass1'
    });
    token = res.body.token;
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe('Profile Endpoints', () => {
    it('should get current user profile', async () => {
        const res = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('username', 'testprofile');
        expect(res.body).not.toHaveProperty('password');
    });

    it('should update bio and avatar', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ bio: 'Test bio', avatar: 'https://avatar.url/image.png' });
        expect(res.statusCode).toBe(200);
        expect(res.body.bio).toBe('Test bio');
        expect(res.body.avatar).toBe('https://avatar.url/image.png');
    });

    it('should reject invalid avatar URL', async () => {
        const res = await request(app)
            .put('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ avatar: 'not_a_url' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    it('should get a user profile by username', async () => {
        const res = await request(app)
            .get('/api/users/search?q=testprofile')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('username', 'testprofile');
        // User profile search endpoint shouldn’t return password field
        expect(res.body[0]).not.toHaveProperty('password');
    });


    it('should return an empty array for invalid username', async () => {
        const res = await request(app)
            .get('/api/users/search?q=invalid')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

});