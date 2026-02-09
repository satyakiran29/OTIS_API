const express = require('express');
const router = express.Router();
const Temple = require('../models/Temple');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all temples
router.get('/', async (req, res) => {
    try {
        const temples = await Temple.find();
        res.json(temples);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific temple
router.get('/:id', async (req, res) => {
    try {
        const temple = await Temple.findById(req.params.id);
        if (!temple) return res.status(404).json({ message: 'Temple not found' });
        res.json(temple);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new temple
router.post('/', protect, admin, async (req, res) => {
    const temple = new Temple({
        name: req.body.name,
        location: req.body.location,
        description: req.body.description,
        history: req.body.history,
        images: req.body.images
    });

    try {
        const newTemple = await temple.save();
        res.status(201).json(newTemple);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a temple
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const temple = await Temple.findById(req.params.id);
        if (!temple) return res.status(404).json({ message: 'Temple not found' });

        temple.name = req.body.name || temple.name;
        temple.location = req.body.location || temple.location;
        temple.description = req.body.description || temple.description;
        temple.history = req.body.history || temple.history;
        temple.images = req.body.images || temple.images;

        const updatedTemple = await temple.save();
        res.json(updatedTemple);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a temple
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const temple = await Temple.findById(req.params.id);
        if (!temple) return res.status(404).json({ message: 'Temple not found' });

        await temple.deleteOne();
        res.json({ message: 'Temple removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
