const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().populate('temple', 'name location');
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('temple', 'name location');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new event
router.post('/', protect, admin, async (req, res) => {
    const event = new Event({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        location: req.body.location,
        temple: req.body.temple,
        image: req.body.image
    });

    try {
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an event
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        Object.assign(event, req.body);

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an event
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
