const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage avec Multer et Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => 'post-' + Date.now() + '-' + file.originalname
  }
});

const upload = multer({ storage: storage });

// Afficher tous les articles
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('admin/posts/index', { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Afficher le formulaire d'ajout d'un article
router.get('/add', (req, res) => {
  res.render('admin/posts/add', { tinymceApiKey: process.env.TINYMCE_API_KEY });
});

// Ajouter un nouvel article
router.post('/add', upload.single('image'), async (req, res) => {
  const { title, content, author } = req.body;
  // L'URL de l'image est maintenant fournie par Cloudinary via req.file.path
  const imageUrl = req.file ? req.file.path : ''; 

  try {
    const newPost = new Post({
      title,
      content,
      author,
      imageUrl
    });
    await newPost.save();
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Afficher le formulaire de modification d'un article
router.get('/edit/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render('admin/posts/edit', { post, tinymceApiKey: process.env.TINYMCE_API_KEY });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Modifier un article
router.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let imageUrl = req.body.existingImageUrl;

    // Si une nouvelle image est uploadée, on récupère sa nouvelle URL depuis Cloudinary
    if (req.file) {
      imageUrl = req.file.path;
    }

    await Post.findByIdAndUpdate(req.params.id, {
      title,
      content,
      author,
      imageUrl
    });
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Supprimer un article
router.delete('/delete/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;