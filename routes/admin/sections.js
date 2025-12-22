const Section = require('../../models/section');
const { createCrudRouter } = require('../../controllers/adminController');

// Create a CRUD router for the Section model
const sectionRouter = createCrudRouter(Section, {
  viewPath: 'sections',
  routePath: 'sections',
  fields: ['title', 'content', 'page'],
});

module.exports = sectionRouter;
