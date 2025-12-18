const mongoose = require('mongoose');

// Sub-schema for comments
const commentSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // --- New field for notification ---
  read: {
    type: Boolean,
    default: false
  }
});

// Main schema for blog posts
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Centrale Quanta'
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema] // Array of comments
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
