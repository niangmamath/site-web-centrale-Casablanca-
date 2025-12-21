const Event = require('../../models/event');
const { createCrudRouter } = require('../../controllers/adminController');

const eventFields = ['title', 'description', 'date', 'location', 'speaker'];
const uploadOptions = { fieldName: 'image', folder: 'events' };

module.exports = createCrudRouter(Event, {
  viewPath: 'events',
  routePath: 'events',
  fields: eventFields,
  uploadOptions,
});
