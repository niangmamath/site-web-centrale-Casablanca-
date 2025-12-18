const express = require('express');
const router = express.Router();
const Event = require('../../models/event.js'); // Corrected path

// Main events page
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.render('admin/events/index', { 
            title: 'Nos Événements',
            events: events,
            layout: 'admin/layout' 
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
        action: `${res.locals.adminPath}/events/new`,
        layout: 'admin/layout'
    });
});

// Admin: Handle new event creation
router.post('/new', async (req, res) => {
    try {
        const { title, description, date, imageUrl } = req.body;
        const newEvent = new Event({ title, description, date, imageUrl });
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
            action: `${res.locals.adminPath}/events/edit/${event._id}?_method=PUT`,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Error fetching event for edit:', error);
        res.status(500).send('Erreur du serveur');
    }
});

// Admin: Handle event update
router.put('/edit/:id', async (req, res) => {
    try {
        const { title, description, date, imageUrl } = req.body;
        await Event.findByIdAndUpdate(req.params.id, { title, description, date, imageUrl });
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
