const express = require('express');
const router = express.Router();
const Post = require('../../models/post');

// --- Centralized Comment Management ---

// Display all unread comments
router.get('/', async (req, res) => {
  try {
    // Find all posts that have at least one unread comment
    const postsWithUnreadComments = await Post.find({ 'comments.read': false }).sort({ createdAt: -1 });

    let unreadComments = [];
    postsWithUnreadComments.forEach(post => {
      // Filter only unread comments and add post context
      const commentsToAdd = post.comments
        .filter(comment => !comment.read)
        .map(comment => ({
          ...comment.toObject(),
          postId: post._id,
          postTitle: post.title
        }));
      unreadComments = unreadComments.concat(commentsToAdd);
    });
    
    // Sort comments by creation date, descending
    unreadComments.sort((a, b) => b.createdAt - a.createdAt);

    res.render('admin/comments/index', { 
      comments: unreadComments, 
      title: 'Nouveaux Commentaires'
    });

  } catch (err) {
    console.error('Error fetching unread comments:', err);
    res.status(500).send('Server Error');
  }
});

// Mark a specific comment as read
router.post('/:commentId/mark-read', async (req, res) => {
    try {
        const { commentId } = req.params;
        
        // This is a complex update. We need to find the post containing the comment.
        await Post.updateOne(
            { 'comments._id': commentId },
            { $set: { 'comments.$.read': true } }
        );

        // Redirect back to the comments page, which will now show one less comment.
        res.redirect(req.headers.referer || '/admin/comments');

    } catch (err) {
        console.error('Error marking comment as read:', err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
