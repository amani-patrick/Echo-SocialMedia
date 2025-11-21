require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(express.json());
app.use(cors());

// Enhanced MongoDB connection with options
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip trying IPv6
})
.then(() => console.log("MongoDB connected for user-service"))
.catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
});

app.get('/', (req, res) => res.send('User Service Running!'));
app.use('/api/users', authRoutes);
app.use('/api/users', profileRoutes);

const port = process.env.PORT || 9000;

if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(port, () => {
        console.log(`User Service started on port ${port}`);
        console.log(`Using MongoDB: ${process.env.MONGO_URI}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error('Unhandled Rejection! Shutting down...');
        console.error(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });
}

module.exports = app;