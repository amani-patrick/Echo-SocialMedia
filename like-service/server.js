require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const likeRouter = require('./routes/like'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/like-service';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected for like-service"))
  .catch(err => console.error("MongoDB connection error", err));

// Health endpoint
app.get('/', (req, res) => {
  res.send("Like Service is running!");
});

// Main API routes
app.use('/api/likes', likeRouter); 

const port = process.env.PORT || 2000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Like Service started on port ${port}`));
}

// Export for Jest/supertest
module.exports = app;
