const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Event = require('../models/event');
const Member = require('../models/member');
const Message = require('../models/message');
const asyncHandler = require('../utils/asyncHandler');
const { createCrudRouter } = require('../controllers/adminController');

router.get('/', asyncHandler(async (req, res) => {
  const postCount = await Post.countDocuments();
  const eventCount = await Event.countDocuments();
  const memberCount = await Member.countDocuments();
  const unreadMessageCount = await Message.countDocuments({ read: false });

  res.render('admin/dashboard', { 
    layout: 'admin/layout',
    postCount, 
    eventCount, 
    memberCount,
    unreadMessageCount,
    title: 'Tableau de bord'
  });
}));

// CRUD Routes Configuration

const postRouter = createCrudRouter(Post, {
  viewPath: 'posts',
  routePath: 'posts',
  fields: ['title', 'content', 'author'],
  uploadOptions: { 
    fieldName: 'image', 
    folder: 'blog-images', 
    dbImageFieldName: 'imageUrl'
  },
});

const memberRouter = createCrudRouter(Member, {
  viewPath: 'members',
  routePath: 'members',
  fields: ['name', 'role', 'bio', 'linkedinUrl'],
  uploadOptions: { 
    fieldName: 'image', // Corrected from 'photo' to 'image'
    folder: 'team-photos', 
    dbImageFieldName: 'imageUrl'
  },
});

const eventRouter = createCrudRouter(Event, {
  viewPath: 'events',
  routePath: 'events',
  fields: ['title', 'date', 'location', 'description'],
  uploadOptions: { 
    fieldName: 'image', 
    folder: 'event-images', 
    dbImageFieldName: 'imageUrl'
  },
});

router.use('/posts', postRouter);
router.use('/members', memberRouter);
router.use('/events', eventRouter);

module.exports = router;
