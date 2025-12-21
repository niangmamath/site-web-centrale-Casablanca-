const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Event = require('../models/event');
const Member = require('../models/member');
const Message = require('../models/message');
const asyncHandler = require('../utils/asyncHandler');

// Admin dashboard with statistics
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

module.exports = router;
