const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../../config/cloudinary');

// Configure Multer to store files in memory, like in other routes
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload a buffer to Cloudinary, consistent with other routes
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: 'blog-images' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

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

// Add a new post using the new upload logic
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let imageUrl = ''; 

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url; // Use the secure URL from Cloudinary
    }

    const newPost = new Post({ title, content, author, imageUrl });
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

// Edit a post using the new upload logic
router.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let imageUrl;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } else {
      // Keep existing image if no new one is uploaded
      const post = await Post.findById(req.params.id);
      imageUrl = post.imageUrl;
    }

    await Post.findByIdAndUpdate(req.params.id, { title, content, author, imageUrl });
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
router.delete('/:postId/comments/delete/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (post) {
      const comment = post.comments.id(commentId);
      if (comment) {
        comment.deleteOne();
        await post.save();
      }
    }
    res.redirect(`${res.locals.adminPath}/posts/edit/${postId}`);
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
