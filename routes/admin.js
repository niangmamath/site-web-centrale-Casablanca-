const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Event = require('../models/event');
const Member = require('../models/member');
const Message = require('../models/message'); // Importer le modèle Message

// Admin dashboard with statistics
// CORRECTIF: Le chemin doit être '/' car le routeur est monté sur '/admin' dans app.js
router.get('/', async (req, res) => {
  try {
    const postCount = await Post.countDocuments();
    const eventCount = await Event.countDocuments();
    const memberCount = await Member.countDocuments();
    const unreadMessageCount = await Message.countDocuments({ read: false }); // Compter les messages non lus

    res.render('admin/dashboard', { 
      layout: 'admin/layout', // Assurez-vous que le layout admin est utilisé
      postCount, 
      eventCount, 
      memberCount,
      unreadMessageCount, // Passer le compte à la vue
      title: 'Tableau de bord' // Ajout du titre manquant
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
