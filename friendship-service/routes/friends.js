const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { FriendRequest, Friendship } = require('../models/friends');
const authenticate = require('../middleware/auth'); // Adjust path as needed
const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:7000';

// Send friend request
router.post('/request', authenticate, async (req, res) => {
  const { to } = req.body;
  if (!mongoose.Types.ObjectId.isValid(to) || req.user.userId === to)
    return res.status(400).json({ error: 'Invalid user.' });

  const exists = await FriendRequest.findOne({ from: req.user.userId, to, status: 'pending' });
  if (exists) return res.status(400).json({ error: 'Request already sent.' });

  const request = await FriendRequest.create({ from: req.user.userId, to });
  // Notification (optional)
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      user: to,
      type: 'follow',
      message: `${req.user.username} sent you a friend request.`,
      data: { requestId: request._id }
    });
  } catch (err) {
    console.error('Notification service error:', err.message);
  }
  res.status(201).json(request);
});

// Respond to friend request
router.post('/respond', authenticate, async (req, res) => {
  const { requestId, action } = req.body;
  const request = await FriendRequest.findById(requestId);
  if (!request || request.to.toString() !== req.user.userId)
    return res.status(404).json({ error: 'Request not found or not authorized.' });
  if (!['accept','reject'].includes(action))
    return res.status(400).json({ error: 'Invalid action.' });

  request.status = (action === 'accept') ? 'accepted' : 'rejected';
  await request.save();

  if (action === 'accept') {
    await Friendship.create({ users: [request.from, request.to] });
    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
        user: request.from,
        type: 'follow',
        message: `${req.user.username} accepted your friend request.`,
        data: { friendId: req.user.userId }
      });
    } catch (err) {
      console.error('Notification service error:', err.message);
    }
  }
  res.json(request);
});

// Get friends list for a user
router.get('/:userId', authenticate, async (req, res) => {
  const friendships = await Friendship.find({ users: req.params.userId });
  const friends = friendships.map(f =>
    f.users.find(u => u.toString() !== req.params.userId)
  );
  res.json(friends);
});

// Get pending requests for a user
router.get('/pending/:userId', authenticate, async (req, res) => {
  const sent = await FriendRequest.find({ from: req.params.userId, status: 'pending' });
  const received = await FriendRequest.find({ to: req.params.userId, status: 'pending' });
  res.json({ sent, received });
});

module.exports = router;
