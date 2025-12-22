const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false } // LIGNE INDISPENSABLE
});

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
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);