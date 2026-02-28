const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');

// Create a Payment Intent
router.post('/create-payment-intent', protect, async (req, res) => {
    try {
        const { amount, description, metadata } = req.body;

        // Stripe requires the amount in the smallest currency unit (e.g., paise for INR)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'inr',
            description: description || 'Otis Platform Payment',
            metadata: {
                ...metadata,
                userId: req.user._id.toString(),
                userName: req.user.name,
                userEmail: req.user.email
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(400).send({
            error: {
                message: error.message,
            }
        });
    }
});

module.exports = router;
