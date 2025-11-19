require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const postRoutes = require('./routes/post');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for post-service"))
  .catch(err => console.error("MongoDB connection error", err));

app.get('/', (req, res) => res.send('Post Service Running!'));
app.use('/api/posts', postRoutes);
app.use('/uploads', express.static('uploads'));


if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 8000;
  app.listen(port, () => console.log(`Post Service started on port ${port}`));
}

module.exports = app;
