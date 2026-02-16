const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all bookings (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate({
                path: 'item',
                populate: { path: 'temple', select: 'name' }
            });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's bookings
router.get('/mybookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: 'item',
                populate: { path: 'temple', select: 'name' }
            });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new booking
router.post('/', protect, async (req, res) => {
    const { type, item, date, members } = req.body;

    // Simple validation could be added here to check availability

    const booking = new Booking({
        user: req.user._id,
        type,
        item,
        typeModel: type === 'event' ? 'Event' : (type === 'seva' ? 'Seva' : 'Temple'),
        date,
        members
    });

    try {
        const newBooking = await booking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Cancel a booking
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking.status = 'cancelled';
        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
