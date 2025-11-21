const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment');
const authenticate = require('../middleware/auth');
const mongoose = require('mongoose');
const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:7000';

const router = express.Router();

// Create comment
router.post('/', authenticate, [
  body('post').isMongoId(),
  body('content').isLength({ min: 1, max: 1000 }),
  body('parent').optional().isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const comment = await Comment.create({
      post: req.body.post,
      author: req.user.userId,
      content: req.body.content,
      parent: req.body.parent || null
    });

    // Notify post owner (optional)
    if (req.user.userId !== req.body.postAuthorId) { // Pass postAuthorId from frontend or fetch from post-service
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
          user: req.body.postAuthorId,
          type: 'comment',
          message: `${req.user.username || 'Someone'} commented on your post.`,
          data: { postId: req.body.post, commentId: comment._id }
        });
      } catch (err) {
        console.error('Notification service error:', err.message);
      }
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating comment.' });
  }
});

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar');
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching comments.' });
  }
});

// Delete a comment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.id, author: req.user.userId
    });
    if (!comment) return res.status(404).json({ error: 'Comment not found or not authorized.' });
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting comment.' });
  }
});

module.exports = router;
