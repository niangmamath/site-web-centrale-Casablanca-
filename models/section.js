const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true,
    enum: ['home', 'team', 'events']
  }
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
