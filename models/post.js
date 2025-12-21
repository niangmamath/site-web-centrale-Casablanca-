const mongoose = require('mongoose');

/**
 * @typedef {object} Comment
 * @property {string} user - The name of the commenter.
 * @property {string} text - The content of the comment.
 * @property {Date} date - The date the comment was posted.
 */
const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

/**
 * @typedef {object} Post
 * @property {string} title - The title of the blog post.
 * @property {string} content - The HTML content of the blog post.
 * @property {string} author - The author of the blog post.
 * @property {string} imageUrl - The URL of the post's cover image.
 * @property {number} likes - The number of likes the post has received.
 * @property {Comment[]} comments - An array of comments on the post.
 * @property {Date} createdAt - The timestamp for when the post was created.
 * @property {Date} updatedAt - The timestamp for when the post was last updated.
 */
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
    default: '' // Default empty string for image URL
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema] // Embed the comment schema
}, { timestamps: true }); // Automatically add createdAt and updatedAt

module.exports = mongoose.model('Post', postSchema);
