const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  attachments: {
    type: [{
      url: { type: String, default: '' },
      type: { type: String, enum: ['image', 'video', 'file'], default: 'file' }
    }],
    default: []
  },
  tags: { type: [String], default: [] },
  likes: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  reactions: {
    type: [{
      user: { type: mongoose.Schema.Types.ObjectId },
      type: { type: String, enum: ['like', 'love', 'haha', 'sad', 'angry'], default: 'like' }
    }],
    default: []
  },
  privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' }
});

module.exports = mongoose.model('Post', postSchema);
