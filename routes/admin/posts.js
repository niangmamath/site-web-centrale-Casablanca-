const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer and Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => 'post-' + Date.now() + '-' + file.originalname
  }
});

const upload = multer({ storage: storage });

// Display all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('admin/posts/index', { posts, title: 'Gérer le blog' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display add post form
router.get('/add', (req, res) => {
  res.render('admin/posts/add', { tinymceApiKey: process.env.TINYMCE_API_KEY, title: 'Ajouter un article' });
});

// Add a new post
router.post('/add', upload.single('image'), async (req, res) => {
  const { title, content, author } = req.body;
  const imageUrl = req.file ? req.file.path : ''; 

  try {
    const newPost = new Post({
      title,
      content,
      author,
      imageUrl
    });
    await newPost.save();
    res.redirect(`${res.locals.adminPath}/posts`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display edit post form
router.get('/edit/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render('admin/posts/edit', { post, tinymceApiKey: process.env.TINYMCE_API_KEY, title: 'Modifier un article' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Edit a post
router.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let imageUrl = req.body.existingImageUrl;

    if (req.file) {
      imageUrl = req.file.path;
    }

    await Post.findByIdAndUpdate(req.params.id, {
      title,
      content,
      author,
      imageUrl
    });
    res.redirect(`${res.locals.adminPath}/posts`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a post
router.delete('/delete/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect(`${res.locals.adminPath}/posts`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- Comment Management ---

// Delete a comment from a post
router.delete('/:postId/comments/delete/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    // Find the comment subdocument and remove it
    const comment = post.comments.id(commentId);
    if (comment) {
      comment.deleteOne(); // Mongoose v6+
      await post.save();
    }
    
    res.redirect(`${res.locals.adminPath}/posts/edit/${postId}`);
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
