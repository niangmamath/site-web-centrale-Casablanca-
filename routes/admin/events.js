const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../../config/cloudinary');
const Event = require('../../models/event.js');
const streamifier = require('streamifier');

// Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: 'events' }, // Store images in an 'events' folder in Cloudinary
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Main events page
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.render('admin/events/index', { 
            title: 'Nos Événements',
            events: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Erreur du serveur');
    }
});

// Admin: Create new event (form)
router.get('/new', (req, res) => {
    res.render('admin/events/add', { 
        title: 'Nouvel Événement',
        event: {}, 
        action: `${res.locals.adminPath}/events/new`
    });
});

// Admin: Handle new event creation with image upload
router.post('/new', upload.single('image'), async (req, res) => {
    try {
        const { title, description, date, location, speaker } = req.body;
        let imageUrl = '';

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const newEvent = new Event({ title, description, date, location, speaker, imageUrl });
        await newEvent.save();
        res.redirect(`${res.locals.adminPath}/events`);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Erreur du serveur');
    }
});

// Admin: Edit event (form)
router.get('/edit/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        res.render('admin/events/edit', {
            title: 'Modifier l\'Événement',
            event: event,
            action: `${res.locals.adminPath}/events/edit/${event._id}?_method=PUT`
        });
    } catch (error) {
        console.error('Error fetching event for edit:', error);
        res.status(500).send('Erreur du serveur');
    }
});

// Admin: Handle event update with image upload
router.put('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, date, location, speaker } = req.body;
        let imageUrl;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        } else {
            // Keep the existing image if no new one is uploaded
            const event = await Event.findById(req.params.id);
            imageUrl = event.imageUrl;
        }

        await Event.findByIdAndUpdate(req.params.id, { title, description, date, location, speaker, imageUrl });
        res.redirect(`${res.locals.adminPath}/events`);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send('Erreur du serveur');
    }
});

// Admin: Handle event deletion
router.delete('/delete/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.redirect(`${res.locals.adminPath}/events`);
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send('Erreur du serveur');
    }
});

module.exports = router;
