require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notification');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for notification-service"))
  .catch(err => console.error("MongoDB connection error", err));

app.use('/api/notifications', notificationRoutes);

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT ||7000;
  app.listen(port, () => console.log(`Notification Service started on port ${port}`));
}

module.exports = app;
