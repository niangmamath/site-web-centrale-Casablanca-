const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String
  },
  imageUrl: {
    type: String
  },
  linkedinUrl: {
    type: String
  }
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
