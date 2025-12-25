const express = require('express');
const router = express.Router();
const Message = require('../../models/message');
const asyncHandler = require('../../utils/asyncHandler');

// GET all messages
router.get('/', asyncHandler(async (req, res, next) => {
  const messages = await Message.find({}).sort({ createdAt: -1 });
  res.render('admin/messages/index', { 
    title: 'Messages Reçus', 
    messages: messages,
    layout: './admin/layout',
    csrfToken: req.csrfToken()
  });
}));

// POST to mark a message as read
router.post('/:id/toggle-read', asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);
  if (message) {
    message.read = !message.read;
    await message.save();
  }
  res.redirect(`${res.locals.adminPath}/messages`);
}));

module.exports = router;
