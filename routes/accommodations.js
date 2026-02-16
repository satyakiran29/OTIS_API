const express = require('express');
const router = express.Router();
const Accommodation = require('../models/Accommodation');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all accommodations
router.get('/', async (req, res) => {
    try {
        const accommodations = await Accommodation.find().populate('temple', 'name location');
        res.json(accommodations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single accommodation
router.get('/:id', async (req, res) => {
    try {
        const accommodation = await Accommodation.findById(req.params.id).populate('temple', 'name location');
        if (!accommodation) return res.status(404).json({ message: 'Accommodation not found' });
        res.json(accommodation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create accommodation (Admin)
router.post('/', protect, admin, async (req, res) => {
    const { name, type, price, capacity, temple, amenities, image } = req.body;
    try {
        const newAccommodation = await Accommodation.create({
            name, type, price, capacity, temple, amenities, image
        });
        res.status(201).json(newAccommodation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update accommodation (Admin)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const updatedAccommodation = await Accommodation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedAccommodation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete accommodation (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Accommodation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Accommodation deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
