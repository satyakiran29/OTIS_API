const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect, admin } = require('../middleware/authMiddleware');

// Create a new donation
router.post('/', protect, async (req, res) => {
    const { templeId, amount, paymentMethod } = req.body;

    const donation = new Donation({
        user: req.user._id,
        temple: templeId,
        amount,
        paymentMethod
    });

    try {
        constnewDonation = await donation.save();
        res.status(201).json(newDonation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get user's donations
router.get('/myquestions', protect, async (req, res) => { // Typo in original plan, fixing to /my
    try {
        const donations = await Donation.find({ user: req.user._id }).populate('temple', 'name');
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fix route path to be standard
router.get('/my', protect, async (req, res) => {
    try {
        const donations = await Donation.find({ user: req.user._id }).populate('temple', 'name');
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all donations (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const donations = await Donation.find()
            .populate('user', 'name email')
            .populate('temple', 'name');
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
