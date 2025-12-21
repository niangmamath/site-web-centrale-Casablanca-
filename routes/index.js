const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { SitemapStream } = require('sitemap');
const { Readable } = require('stream');

const Section = require('../models/section');
const Event = require('../models/event');
const Member = require('../models/member');
const Post = require('../models/post');
const Message = require('../models/message');

// --- Blog Routes ---

router.get('/blog', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const og = {
      description: 'Découvrez les derniers articles de notre blog sur l\'informatique quantique, les événements et les projets du club Centrale Quanta.'
    };
    res.render('blog', { posts, layout: 'layout', title: 'Blog', og });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/blog/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('404', { layout: 'layout' });
    }
    const recentPosts = await Post.find({ _id: { $ne: req.params.id } }).sort({ createdAt: -1 }).limit(3);
    
    // SEO enhancements
    const og = {
      title: post.title,
      description: post.content.substring(0, 200).replace(/<[^>]*>/g, '').trim(),
      image: post.coverImage,
      url: `${req.protocol}://${req.get('host')}/blog/${post._id}`
    };

    res.render('post', { post, recentPosts, layout: 'layout', title: post.title, og });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

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

router.post('/blog/:id/comment', 
  [
    body('user').trim().not().isEmpty().withMessage('Le nom est requis.').escape(),
    body('text').trim().not().isEmpty().withMessage('Le commentaire ne peut être vide.').escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // For simplicity, redirecting. A better UX would re-render with errors.
      return res.redirect(`/blog/${req.params.id}`);
    }
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).send('Post not found');
      }
      const { user, text } = req.body; // Sanitized data
      post.comments.push({ user, text });
      await post.save();
      res.redirect(`/blog/${req.params.id}`);
    } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).send('Server Error');
    }
  }
);

// --- Other Routes ---

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
    const og = {
      description: 'Participez à nos prochains ateliers, séminaires et conférences sur l\'informatique quantique. Restez informé des dernières activités de Centrale Quanta.'
    };
    res.render('events', { title: 'Nos Événements', events, sections, layout: 'layout', og });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/team', async (req, res) => {
  try {
    const members = await Member.find().select('name role imageUrl linkedinUrl');
    const sections = await Section.find({ page: 'team' });
    const og = {
      description: 'Rencontrez l\'équipe de Centrale Quanta, des étudiants passionnés par l\'informatique quantique et dédiés à la promotion de cette technologie.'
    };
    res.render('team', { title: 'Notre Équipe', members, sections, layout: 'layout', og });
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
    const og = {
      title: member.name,
      description: member.bio || 'Membre de l\'équipe Centrale Quanta.',
      image: member.imageUrl,
      url: `${req.protocol}://${req.get('host')}/team/${member._id}`
    };
    res.render('member-detail', { title: member.name, member, layout: 'layout', og });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/contact', (req, res) => {
  try {
    const og = {
      description: 'Contactez Centrale Quanta pour toute question, proposition de collaboration ou pour rejoindre notre communauté d\'innovateurs en informatique quantique.'
    };
    res.render('contact', { title: 'Contactez-nous', layout: 'layout', status: req.query.status, og });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/contact', 
  [
    body('name').trim().not().isEmpty().withMessage('Le nom est requis.').escape(),
    body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
    body('message').trim().not().isEmpty().withMessage('Le message ne peut être vide.').escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect('/contact?status=error');
    }
    try {
      const { name, email, message } = req.body; // Sanitized data
      const newMessage = new Message({ name, email, message });
      await newMessage.save();
      res.redirect('/contact?status=success');
    } catch (err) {
      console.error('Error saving message:', err);
      res.redirect('/contact?status=error');
    }
  }
);

// Sitemap Generation
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/blog', changefreq: 'weekly', priority: 0.8 },
      { url: '/events', changefreq: 'monthly', priority: 0.7 },
      { url: '/team', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'yearly', priority: 0.5 },
    ];

    const posts = await Post.find().select('_id updatedAt').sort({ createdAt: -1 });
    posts.forEach(post => {
      links.push({
        url: `/blog/${post._id}`,
        lastmod: post.updatedAt,
        changefreq: 'weekly',
        priority: 0.9
      });
    });
    
    const members = await Member.find().select('_id');
    members.forEach(member => {
        links.push({
            url: `/team/${member._id}`,
            changefreq: 'monthly',
            priority: 0.6
        });
    });

    const stream = new SitemapStream({ hostname: baseUrl });

    res.writeHead(200, {
      'Content-Type': 'application/xml',
    });

    const readableStream = Readable.from(links);
    readableStream.pipe(stream).pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

module.exports = router;
