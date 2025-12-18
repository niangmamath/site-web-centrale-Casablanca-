const express = require('express');
const router = express.Router();
const Message = require('../../models/message'); // Corrected path

// GET all messages
router.get('/', async (req, res, next) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.render('admin/messages/index', { 
      title: 'Messages Reçus', 
      messages: messages,
      layout: './admin/layout' // Specify admin layout
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    next(error);
  }
});

// POST to mark a message as read
router.post('/:id/toggle-read', async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (message) {
      message.read = !message.read;
      await message.save();
    }
    res.redirect('/admin/messages');
  } catch (error) {
    console.error('Error toggling message read status:', error);
    next(error);
  }
});

module.exports = router;
