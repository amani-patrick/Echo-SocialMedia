require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const commentRouter = require('./routes/comment');

const app = express();
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/comment-service';
mongoose.connect(MONGO_URI);
mongoose.connection.on('connected', () =>
  console.log('MongoDB connected for comment-service')
);

// Health Check
app.get('/', (req, res) => {
  res.send("Comment Service is running!");
});

// Main API routes
app.use('/api/comments', commentRouter);

// Export the app for testing (supertest)
module.exports = app;

// Start server only if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("Comment Service started on port", PORT);
  });
}
