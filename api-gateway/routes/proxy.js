const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Microservice URLs (from .env)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:9000';
const POST_SERVICE_URL = process.env.POST_SERVICE_URL || 'http://localhost:4000';
const FRIENDSHIP_SERVICE_URL = process.env.FRIENDSHIP_SERVICE_URL || 'http://localhost:6000';
const COMMENT_SERVICE_URL = process.env.COMMENT_SERVICE_URL || 'http://localhost:5000';
const LIKE_SERVICE_URL = process.env.LIKE_SERVICE_URL || 'http://localhost:2000';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:7000';

// Proxy rules
router.use('/api/users', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true }));
router.use('/api/posts', createProxyMiddleware({ target: POST_SERVICE_URL, changeOrigin: true }));
router.use('/api/friends', createProxyMiddleware({ target: FRIENDSHIP_SERVICE_URL, changeOrigin: true }));
router.use('/api/comments', createProxyMiddleware({ target: COMMENT_SERVICE_URL, changeOrigin: true }));
router.use('/api/likes', createProxyMiddleware({ target: LIKE_SERVICE_URL, changeOrigin: true }));
router.use('/api/notifications', createProxyMiddleware({ target: NOTIFICATION_SERVICE_URL, changeOrigin: true }));

// Optional: Health check for API gateway
router.get('/', (req, res) => res.send('API Gateway is running!'));

module.exports = router;
