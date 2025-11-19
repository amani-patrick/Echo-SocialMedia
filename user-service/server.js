require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes= require('./routes/profile')

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected for user-service"))
.catch(err => console.error("MongoDB connection error", err));


app.get('/', (req, res) => res.send('User Service Running!'));
app.use('/api/users', authRoutes);
app.use('/api/users', profileRoutes);

const port = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`User Service started on port ${port}`));
}

module.exports = app;

