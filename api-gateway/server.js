require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const proxyRouter = require('./routes/proxy');

const app = express();

app.disable('x-powered-by');

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : '*';

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    skip: () => process.env.NODE_ENV === 'test'
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: Date.now() });
});

app.use('/', proxyRouter);

const port = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API gateway listening on ${port}`);
  });
}

module.exports = app;
