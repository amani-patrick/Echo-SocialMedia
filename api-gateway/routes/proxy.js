const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

const SERVICE_CONFIG = [
  { path: '/api/users', name: 'users', envKey: 'USER_SERVICE_URL', fallback: 'http://localhost:9000' },
  { path: '/api/posts', name: 'posts', envKey: 'POST_SERVICE_URL', fallback: 'http://localhost:8000' },
  { path: '/api/friends', name: 'friends', envKey: 'FRIENDSHIP_SERVICE_URL', fallback: 'http://localhost:6000' },
  { path: '/api/comments', name: 'comments', envKey: 'COMMENT_SERVICE_URL', fallback: 'http://localhost:5000' },
  { path: '/api/likes', name: 'likes', envKey: 'LIKE_SERVICE_URL', fallback: 'http://localhost:2000' },
  { path: '/api/notifications', name: 'notifications', envKey: 'NOTIFICATION_SERVICE_URL', fallback: 'http://localhost:7000' }
];

const createGatewayProxy = (service) => {
  const target = process.env[service.envKey] || service.fallback;
  console.log(`[Gateway] Mounting ${service.path} -> ${target}`);

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => {
      const sanitized = path.startsWith('/') ? path : `/${path}`;
      const combined = `${service.path}${sanitized}`;
      return combined.replace(/\/{2,}/g, '/');
    },
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    onProxyReq(proxyReq, req) {
      if (req.body && Object.keys(req.body).length) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        proxyReq.end();
      }
      console.log(`[ProxyReq:${service.name}] ${req.method} ${req.originalUrl}`);
    },
    onProxyRes(proxyRes, req) {
      console.log(`[ProxyRes:${service.name}] ${req.method} ${req.originalUrl} <- ${proxyRes.statusCode}`);
    },
    onError(err, req, res) {
      console.error(`[ProxyErr:${service.name}] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({
          error: `Unable to reach ${service.name} service`,
          details: err.message
        });
      }
    }
  });
};

SERVICE_CONFIG.forEach((service) => {
  router.use(service.path, createGatewayProxy(service));
});

router.get('/', (req, res) => {
  res.send('API Gateway is running!');
});

module.exports = router;