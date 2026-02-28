const express = require('express');
const router = express.Router();
const Seva = require('../models/Seva');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all sevas
router.get('/', async (req, res) => {
    try {
        const sevas = await Seva.find().populate('temple', 'name');

        // Calculate availability for each seva
        const sevasWithAvailability = await Promise.all(sevas.map(async (seva) => {
            // Count confirmed/pending bookings
            // Note: In a real app, this should filter by date. 
            // For now, we'll assume the limit is "per day" or "total" based on simplicity, 
            // or just count all future bookings if date logic was complex.
            // Simplified: Count all bookings for this item. 
            // Better: Filter by date if the frontend sends a date. 
            // As per request "show tickets info", we'll count ALL bookings for now or refine if needed.
            // Let's assume the limit is a global cap for simplicity unless date is provided.
            // Actually, usually limits are per event/day. 
            // Let's implement a simple "Total Booked" vs "Limit" for now.

            const Booking = require('../models/Booking');
            // Use aggregation to sum up the 'members' field which represents tickets
            const result = await Booking.aggregate([
                {
                    $match: {
                        item: seva._id,
                        status: { $in: ['confirmed', 'pending'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: "$members" }
                    }
                }
            ]);

            const bookedCount = result.length > 0 ? result[0].totalTickets : 0;

            return {
                ...seva.toObject(),
                availableTickets: Math.max(0, seva.ticketLimit - bookedCount),
                bookedCount
            };
        }));

        res.json(sevasWithAvailability);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get sevas for a specific temple
router.get('/temple/:templeId', async (req, res) => {
    try {
        const sevas = await Seva.find({ temple: req.params.templeId });

        const sevasWithAvailability = await Promise.all(sevas.map(async (seva) => {
            const Booking = require('../models/Booking');
            const result = await Booking.aggregate([
                {
                    $match: {
                        item: seva._id,
                        status: { $in: ['confirmed', 'pending'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: "$members" }
                    }
                }
            ]);

            const bookedCount = result.length > 0 ? result[0].totalTickets : 0;

            return {
                ...seva.toObject(),
                availableTickets: Math.max(0, seva.ticketLimit - bookedCount),
                bookedCount
            };
        }));

        res.json(sevasWithAvailability);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new seva
router.post('/', protect, admin, async (req, res) => {
    const seva = new Seva({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        temple: req.body.temple,
        duration: req.body.duration,
        ticketLimit: req.body.ticketLimit
    });

    try {
        const newSeva = await seva.save();
        res.status(201).json(newSeva);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a seva
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const seva = await Seva.findById(req.params.id);
        if (!seva) return res.status(404).json({ message: 'Seva not found' });

        Object.assign(seva, req.body);

        const updatedSeva = await seva.save();
        res.json(updatedSeva);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a seva
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const seva = await Seva.findById(req.params.id);
        if (!seva) return res.status(404).json({ message: 'Seva not found' });

        await seva.deleteOne();
        res.json({ message: 'Seva removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
