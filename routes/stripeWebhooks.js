const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');
const sendEmail = require('../utils/sendEmail');

// The route expects raw body from express.raw() in server.js
router.post('/', async (req, res) => {
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        try {
            const metadata = paymentIntent.metadata;

            if (metadata.type !== 'donation') {
                console.log(`Payment intent succeeded for non-donation: ${metadata.bookingType || metadata.type}`);
                return res.json({ received: true });
            }

            // Create donation using metadata
            const donation = new Donation({
                user: metadata.userId,
                temple: metadata.templeId,
                amount: metadata.amount,
                donorName: metadata.donorName,
                gothram: metadata.gothram || '',
                occasion: metadata.occasion || '',
                dob: metadata.dob,
                gender: metadata.gender,
                address: metadata.address,
                address2: metadata.address2 || '',
                city: metadata.city,
                zipcode: metadata.zipcode,
                state: metadata.state,
                country: metadata.country,
                mobile: metadata.mobile,
                paymentMethod: 'Card',
                status: 'completed'
            });

            const savedDonation = await donation.save();

            if (metadata.userEmail) {
                sendEmail({
                    email: metadata.userEmail,
                    subject: 'Donation Receipt - Temple Info System',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Thank you for your generous donation, ${metadata.userName || 'Devotee'}!</h2>
                            <p>We have successfully received your donation of <strong>₹${metadata.amount}</strong>.</p>
                            <p>Your support helps us maintain the heritage and spiritual activities of our temples.</p>
                            <ul>
                                <li><strong>Receipt ID:</strong> ${savedDonation._id}</li>
                            </ul>
                            <p>May blessings be upon you.</p>
                        </div>
                    `
                });
            }
            console.log('Webhook successfully processed donation:', savedDonation._id);
        } catch (error) {
            console.error('Error saving donation via webhook:', error);
            return res.status(500).send('Database Error');
        }
    }

    res.json({ received: true });
});

module.exports = router;
