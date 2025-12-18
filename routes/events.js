const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Event = require('../models/event');
const Section = require('../models/section');
const streamifier = require('streamifier');

// Public page to list all events
router.get('/', async (req, res) => {
  try {
    // Use .lean() to get plain JavaScript objects that can be modified
    const events = await Event.find().sort({ date: 'desc' }).lean();
    const sections = await Section.find({ page: 'events' }).sort({ order: 1 });

    // Construct the base URL for sharing
    const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // Add a unique shareUrl to each event object
    events.forEach(event => {
      event.shareUrl = `${baseUrl}#${event._id}`;
    });

    res.render('events', { 
      title: 'Événements', 
      events: events, 
      sections: sections,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ... (le reste du fichier reste inchangé)

// Helper function to upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'events' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};


// Admin dashboard for events
router.get('/admin/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.render('admin/events/index', { events });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Form to add a new event
router.get('/admin/events/add', (req, res) => {
  res.render('admin/events/add');
});

// Handle adding a new event
router.post('/admin/events/add', upload.single('image'), async (req, res) => {
  try {
    const { title, date, location, description, speaker } = req.body;
    let imageUrl = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const newEvent = new Event({ title, date, location, description, speaker, imageUrl });
    await newEvent.save();
    res.redirect('/admin/events');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Form to edit an event
router.get('/admin/events/edit/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.render('admin/events/edit', { event });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Handle editing an event
router.post('/admin/events/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, date, location, description, speaker } = req.body;
    let imageUrl;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } else {
      const event = await Event.findById(req.params.id);
      imageUrl = event.imageUrl;
    }

    await Event.findByIdAndUpdate(req.params.id, { title, date, location, description, speaker, imageUrl });
    res.redirect('/admin/events');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Handle deleting an event
router.post('/admin/events/delete/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect('/admin/events');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
