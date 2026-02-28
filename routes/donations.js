const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect, admin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

// Create a new donation
router.post('/', protect, async (req, res) => {
    const {
        templeId, amount, paymentMethod,
        donorName, gothram, occasion, dob, gender,
        address, address2, city, zipcode, state, country,
        mobile, donationDate
    } = req.body;

    const donation = new Donation({
        user: req.user._id,
        temple: templeId,
        amount,
        paymentMethod,
        donorName, gothram, occasion, dob, gender,
        address, address2, city, zipcode, state, country,
        mobile, donationDate
    });

    try {
        const newDonation = await donation.save();

        // Send Donation Receipt email asynchronously
        sendEmail({
            email: req.user.email,
            subject: 'Donation Receipt - Temple Info System',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Thank you for your generous donation, ${req.user.name}!</h2>
                    <p>We have successfully received your donation of <strong>₹${amount}</strong>.</p>
                    <p>Your support helps us maintain the heritage and spiritual activities of our temples.</p>
                    <ul>
                        <li><strong>Receipt ID:</strong> ${newDonation._id}</li>
                        <li><strong>Date:</strong> ${new Date(donationDate).toLocaleDateString()}</li>
                    </ul>
                    <p>May blessings be upon you.</p>
                </div>
            `
        });

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
