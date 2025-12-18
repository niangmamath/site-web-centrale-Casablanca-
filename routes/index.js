const express = require('express');
const router = express.Router();
const Section = require('../models/section');
const Event = require('../models/event');
const Member = require('../models/member');
const Post = require('../models/post');
const Message = require('../models/message');

// --- Blog Routes ---

// Route pour la page du blog (liste des articles)
router.get('/blog', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('blog', { posts, layout: 'layout', title: 'Blog' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Route pour un article de blog individuel
router.get('/blog/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('404', { layout: 'layout' });
    }
    
    const recentPosts = await Post.find({ _id: { $ne: req.params.id } })
      .sort({ createdAt: -1 })
      .limit(3);

    res.render('post', { 
      post, 
      recentPosts, 
      layout: 'layout', 
      title: post.title 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Route to handle liking a post
router.post('/blog/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    post.likes += 1;
    await post.save();
    res.redirect(`/blog/${req.params.id}`);
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).send('Server Error');
  }
});

// Route to handle commenting on a post
router.post('/blog/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    const { user, text } = req.body;
    post.comments.push({ user, text });
    await post.save();
    res.redirect(`/blog/${req.params.id}`);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Server Error');
  }
});

// --- Other Routes (Home, Events, Team, Contact) ---

router.get('/', async (req, res) => {
  try {
    const sections = await Section.find({ page: 'home' });
    res.render('index', { title: 'Accueil', sections, layout: 'layout' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    const sections = await Section.find({ page: 'events' });
    
    events.forEach(event => {
      event.shareUrl = `${req.protocol}://${req.get('host')}/events#${event._id}`;
    });

    res.render('events', { 
      title: 'Nos Événements',
      events, 
      sections, 
      layout: 'layout' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/team', async (req, res) => {
  try {
    const members = await Member.find().select('name role imageUrl linkedinUrl');
    const sections = await Section.find({ page: 'team' });
    res.render('team', { title: 'Notre Équipe', members, sections, layout: 'layout' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/team/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).render('404', { layout: 'layout' });
    }
    res.render('member-detail', { title: member.name, member, layout: 'layout' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/contact', (req, res) => {
  try {
    res.render('contact', { 
      title: 'Contactez-nous', 
      layout: 'layout',
      status: req.query.status 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.redirect('/contact?status=success');
  } catch (err) {
    console.error('Error saving message:', err);
    res.redirect('/contact?status=error');
  }
});

module.exports = router;
