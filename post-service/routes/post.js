const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const authenticate = require('../middleware/auth'); 
const axios = require('axios');
const multer = require('multer');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4000';

const router = express.Router();

async function getUserPublicInfo(userId) {
  try {
    const res = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}/profile`);
    return res.data;
  } catch (err) {
    return { username: "Unknown", avatar: null };
  }
}

router.post('/upload', authenticate, upload.single('attachment'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  const url = `/uploads/${req.file.filename}`;
  const type = req.file.mimetype.startsWith('image') ? 'image' : 'file';
  res.status(201).json({ url, type });
});


router.post('/', authenticate, [
  body('content').isLength({ min: 1, max: 1000 }),
  body('attachments').optional().isArray(),
  body('tags').optional().isArray(),
  body('privacy').optional().isIn(['public', 'friends', 'private'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const post = new Post({
      author: req.user.userId,
      content: req.body.content,
      attachments: req.body.attachments || [],
      tags: req.body.tags || [],
      privacy: req.body.privacy || 'public'
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating post.' });
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
  body('content').isLength({ min: 1, max: 1000 }),
  body('attachments').optional().isArray(),
  body('tags').optional().isArray(),
  body('privacy').optional().isIn(['public', 'friends', 'private'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const updateData = {
      content: req.body.content,
      updatedAt: Date.now()
    };
    if (req.body.attachments !== undefined) updateData.attachments = req.body.attachments;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;
    if (req.body.privacy !== undefined) updateData.privacy = req.body.privacy;
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userId },
      updateData,
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found or not authorized.' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating post.' });
  }
});

router.post('/:id/reaction', authenticate, [
  body('type').isIn(['like', 'love', 'haha', 'sad', 'angry'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    // Validate ObjectId
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ error: "Post not found or not authorized." });
    // Find the post
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (!post.reactions) post.reactions = [];
    // Find existing reaction for user (be robust against ObjectId vs string)
    const existing = post.reactions.find(
      r => r.user?.toString() === req.user.userId
    );
    if (existing) {
      existing.type = req.body.type;
    } else {
      post.reactions.push({ user: req.user.userId, type: req.body.type });
    }
    await post.save();
    res.json(post.reactions);
  } catch (err) {
    console.error('Reaction endpoint error:', err);
    res.status(500).json({ error: 'Error updating reaction.' });
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

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const enrichedPosts = await Promise.all(posts.map(async post => {
      const author = await getUserPublicInfo(post.author);
      return {
        ...post.toObject(),
        author: {
          userId: post.author,
          username: author.username,
          avatar: author.avatar,
        }
      };
    }));
    res.json(enrichedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching posts.' });
  }
});

module.exports = router;
