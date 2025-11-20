const express = require('express');
const User = require('../models/user');
const authenticate = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get current user's profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

// Update profile (bio and avatar)
router.put('/me', authenticate, [
  body('bio').optional().isLength({ max: 300 }),
  body('avatar').optional().isURL()
], async (req, res) => {
  const errors= validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updates = {};
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, select: '-password -resetPasswordToken -resetPasswordExpires'  }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error updating profile.'  });
  }
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required'  });
  try {
    // Case-insensitive partial match on username
    const users = await User.find({ username: { $regex: q, $options: 'i' } }).select('username bio avatar');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error searching users.' });
  }
});

module.exports = router;
