require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxyRoutes = require('./routes/proxy');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', proxyRoutes);

const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Api-gateway waiting on port", PORT);
  });
}

module.exports = app;