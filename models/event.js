const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  speaker: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Event', eventSchema);
