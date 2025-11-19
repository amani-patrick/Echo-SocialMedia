const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const authenticate = require('../middleware/auth'); 

const router = express.Router();

// Create post
router.post('/', authenticate, [
  body('content').isLength({ min: 1, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const post = new Post({
      author: req.user.userId,
      content: req.body.content
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating post.' });
  }
});

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching posts.' });
  }
});

// Get a user's posts
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user posts.' });
  }
});

// Update post
router.put('/:id', authenticate, [
  body('content').isLength({ min: 1, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userId },
      { content: req.body.content, updatedAt: Date.now() },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found or not authorized.' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating post.' });
  }
});

// Delete post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.userId });
    if (!post) return res.status(404).json({ error: 'Post not found or not authorized.' });
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting post.' });
  }
});

module.exports = router;
