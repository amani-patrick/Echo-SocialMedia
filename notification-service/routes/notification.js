const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Notification = require('../models/notification');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Create notification (triggered from other services)
router.post('/', [
  body('user').isMongoId(),
  body('type').isIn(['comment', 'like', 'reaction', 'follow', 'system']),
  body('message').isLength({ min: 1, max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const notification = new Notification({
      user: new mongoose.Types.ObjectId(req.body.user), 
      type: req.body.type,
      message: req.body.message,
      data: req.body.data
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating notification.' });
  }
});

// Get logged-in user's notifications
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) return res.status(403).json({ error: 'Not authorized.' });
    const notifications = await Notification.find({ user: new mongoose.Types.ObjectId(req.params.userId) }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching notifications.' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user:new mongoose.Types.ObjectId(req.user.userId) },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found.' });
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating notification.' });
  }
});

module.exports = router;
