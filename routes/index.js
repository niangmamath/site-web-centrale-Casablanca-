const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const asyncHandler = require('../utils/asyncHandler');

const Section = require('../models/section');
const Event = require('../models/event');
const Member = require('../models/member');
const Post = require('../models/post');
const Message = require('../models/message');

// Middleware to set default layout for all routes in this file
router.use((req, res, next) => {
  res.locals.layout = 'layout';
  next();
});

// --- Page Rendering Functions ---

const renderPage = (req, res, view, title, options = {}) => {
  const defaultOptions = {
    title,
    og: { description: `Description par défaut pour ${title}` },
  };
  res.render(view, { ...defaultOptions, ...options });
};

// --- Blog Routes ---

router.get('/blog', asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  renderPage(req, res, 'blog', 'Blog', {
    posts,
    og: { description: 'Découvrez les derniers articles de notre blog sur l\'informatique quantique, les événements et les projets du club Centrale Quanta.' },
  });
}));

router.get('/blog/:id', asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).render('404');
  
  const recentPosts = await Post.find({ _id: { $ne: req.params.id } }).sort({ createdAt: -1 }).limit(3);
  const og = {
    title: post.title,
    description: post.content.substring(0, 200).replace(/<[^>]*>/g, '').trim(),
    image: post.coverImage,
    url: `${req.protocol}://${req.get('host')}/blog/${post._id}`,
  };
  renderPage(req, res, 'post', post.title, { post, recentPosts, og });
}));

router.post('/blog/:id/like', asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
  if (!post) return res.status(404).send('Post not found');
  res.redirect(`/blog/${req.params.id}`);
}));

router.post('/blog/:id/comment', 
  [
    body('user').trim().not().isEmpty().withMessage('Le nom est requis.').escape(),
    body('text').trim().not().isEmpty().withMessage('Le commentaire ne peut être vide.').escape(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // NOTE: For a better UX, re-render the page with an error message.
      return res.redirect(`/blog/${req.params.id}`);
    }
    
    const { user, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    post.comments.push({ user, text });
    await post.save();
    res.redirect(`/blog/${req.params.id}`);
  })
);

// --- Main Site Routes ---

router.get('/', asyncHandler(async (req, res) => {
  const sections = await Section.find({ page: 'home' });
  renderPage(req, res, 'index', 'Accueil', { sections });
}));

router.get('/events', asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ date: 1 }).lean();
  const sections = await Section.find({ page: 'events' });
  events.forEach(event => {
    event.shareUrl = `${req.protocol}://${req.get('host')}/events#${event._id}`;
  });
  renderPage(req, res, 'events', 'Nos Événements', { events, sections, og: { description: 'Participez à nos prochains ateliers, séminaires et conférences sur l\'informatique quantique.' } });
}));

router.get('/team', asyncHandler(async (req, res) => {
  const members = await Member.find().select('name role imageUrl linkedinUrl');
  const sections = await Section.find({ page: 'team' });
  renderPage(req, res, 'team', 'Notre Équipe', { members, sections, og: { description: 'Rencontrez l\'équipe de Centrale Quanta, des étudiants passionnés par l\'informatique quantique.' } });
}));

router.get('/team/:id', asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).render('404');
  
  const og = {
    title: member.name,
    description: member.bio || 'Membre de l\'équipe Centrale Quanta.',
    image: member.imageUrl,
    url: `${req.protocol}://${req.get('host')}/team/${member._id}`
  };
  renderPage(req, res, 'member-detail', member.name, { member, og });
}));

router.get('/contact', (req, res) => {
  renderPage(req, res, 'contact', 'Contactez-nous', { 
    status: req.query.status, 
    og: { description: 'Contactez Centrale Quanta pour toute question, proposition de collaboration ou pour rejoindre notre communauté.' } 
  });
});

router.post('/contact', 
  [
    body('name').trim().not().isEmpty().withMessage('Le nom est requis.').escape(),
    body('email').isEmail().withMessage('Email invalide.').normalizeEmail(),
    body('message').trim().not().isEmpty().withMessage('Le message ne peut être vide.').escape(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect('/contact?status=error');
    }
    
    const { name, email, message } = req.body;
    await new Message({ name, email, message }).save();
    res.redirect('/contact?status=success');
  })
);

// --- Sitemap ---

router.get('/sitemap.xml', asyncHandler(async (req, res) => {
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
    links.push({ url: `/blog/${post._id}`, lastmod: post.updatedAt, priority: 0.9 });
  });
  
  const members = await Member.find().select('_id');
  members.forEach(member => {
    links.push({ url: `/team/${member._id}`, changefreq: 'monthly', priority: 0.6 });
  });

  const stream = new SitemapStream({ hostname: baseUrl });
  res.writeHead(200, { 'Content-Type': 'application/xml' });
  
  const data = await streamToPromise(Readable.from(links).pipe(stream));
  res.end(data);
}));

module.exports = router;
