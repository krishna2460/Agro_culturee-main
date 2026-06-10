const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  profilePic: { type: String, default: 'profile0.png' },
  comment: { type: String, required: true }
}, { timestamps: true });

const BlogSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorUsername: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  likes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String }
  }],
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
