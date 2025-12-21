const Post = require('../../models/post');
const { createCrudRouter } = require('../../controllers/adminController');

const postFields = ['title', 'content', 'author'];
const uploadOptions = { fieldName: 'image', folder: 'blog-images' };

module.exports = createCrudRouter(Post, {
  viewPath: 'posts',
  routePath: 'posts',
  fields: postFields,
  uploadOptions,
});
