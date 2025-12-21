const Member = require('../../models/member');
const { createCrudRouter } = require('../../controllers/adminController');

const memberFields = ['name', 'role', 'bio', 'linkedinUrl'];
const uploadOptions = { fieldName: 'image', folder: 'team' };

module.exports = createCrudRouter(Member, {
  viewPath: 'members',
  routePath: 'members',
  fields: memberFields,
  uploadOptions,
});
