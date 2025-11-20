const express = require('express');
const { body, validationResult } = require('express-validator');
const Like = require('../models/like');
const authenticate = require('../middleware/auth');
const mongoose = require('mongoose');
const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:7000';

const router = express.Router();

// Like an entity
router.post('/', authenticate, [
  body('entityId').isMongoId(),
  body('entityType').isIn(['post', 'comment'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { entityId, entityType } = req.body;
    const like = await Like.findOneAndUpdate(
      { entityId, entityType, user: req.user.userId },
      { $setOnInsert: { createdAt: Date.now() } },
      { new: true, upsert: true }
    );

    // Optionally trigger notification (pass entityOwner from front or fetch)
    if (req.body.entityOwner && req.user.userId !== req.body.entityOwner) {
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
          user: req.body.entityOwner,
          type: 'like',
          message: `${req.user.username || 'Someone'} liked your ${entityType}.`,
          data: { entityId, entityType }
        });
      } catch (err) {
        console.error('Notification service error:', err.message);
      }
    }

    res.status(201).json(like);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already liked.' });
    console.error(err);
    res.status(500).json({ error: 'Error liking entity.' });
  }
});

// Unlike an entity
router.delete('/', authenticate, [
  body('entityId').isMongoId(),
  body('entityType').isIn(['post', 'comment'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { entityId, entityType } = req.body;
    const result = await Like.findOneAndDelete({ entityId, entityType, user: req.user.userId });
    if (!result) return res.status(404).json({ error: 'Not liked yet.' });
    res.json({ message: 'Unliked.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error unliking entity.' });
  }
});

// Get likes for an entity
router.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const likes = await Like.find({ entityType, entityId }).sort({ createdAt: 1 });
    res.json(likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching likes.' });
  }
});

// Get what entities a user liked (optional)
router.get('/user/:userId', async (req, res) => {
  try {
    const likes = await Like.find({ user: req.params.userId });
    res.json(likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user likes.' });
  }
});

module.exports = router;
