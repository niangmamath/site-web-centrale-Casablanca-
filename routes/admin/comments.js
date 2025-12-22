const express = require('express');
const router = express.Router();
const csurf = require('csurf');
const Post = require('../../models/post');
const asyncHandler = require('../../utils/asyncHandler');
const mongoose = require('mongoose');

const csrfProtection = csurf({ cookie: true });

router.use(csrfProtection);

// GET all comments
router.get('/', asyncHandler(async (req, res) => {
  const postsWithComments = await Post.find({ 'comments.0': { $exists: true } }).sort({ createdAt: -1 });

  let allComments = [];
  if (postsWithComments) {
    postsWithComments.forEach(post => {
      const commentsToAdd = post.comments.map(comment => ({
        _id: comment._id,
        author: comment.user,       // CORRIGÉ: Utilise le bon champ du modèle
        content: comment.text,      // CORRIGÉ: Utilise le bon champ du modèle
        createdAt: comment.date,    // CORRIGÉ: Utilise le bon champ du modèle
        read: comment.read || false, // CORRIGÉ: Gère le nouveau champ
        postId: post._id,
        postTitle: post.title
      }));
      allComments.push(...commentsToAdd);
    });
  }

  allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.render('admin/comments/index', {
    title: 'Gestion des Commentaires',
    comments: allComments,
    csrfToken: req.csrfToken(),
    layout: './admin/layout'
  });
}));

// POST to toggle a comment's read status
router.post('/:commentId/toggle-read', asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const post = await Post.findOne({ 'comments._id': new mongoose.Types.ObjectId(commentId) });

    if (post) {
        const comment = post.comments.id(new mongoose.Types.ObjectId(commentId));
        if (comment) {
            // La bascule fonctionne car `read` existe dans le schéma
            const newReadStatus = !comment.read;
            await Post.updateOne(
                { 'comments._id': new mongoose.Types.ObjectId(commentId) },
                { $set: { 'comments.$.read': newReadStatus } }
            );
        }
    }
    res.redirect(`${res.locals.adminPath}/comments`);
}));

// DELETE a comment
router.post('/:commentId/delete', asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    await Post.updateOne(
        { 'comments._id': new mongoose.Types.ObjectId(commentId) },
        { $pull: { comments: { _id: new mongoose.Types.ObjectId(commentId) } } }
    );
    res.redirect(`${res.locals.adminPath}/comments`);
}));

module.exports = router;
