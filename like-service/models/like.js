const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true }, // post/comment/etc.
  entityType: { type: String, required: true, enum: ['post', 'comment'] }, // type of content liked
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only like an entity once
likeSchema.index({ entityId: 1, entityType: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
