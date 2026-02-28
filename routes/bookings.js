const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

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
    const { type, item, date, members, paymentIntentId } = req.body;

    const computedTypeModel = type === 'event' ? 'Event' : (type === 'seva' ? 'Seva' : 'Temple');

    const booking = new Booking({
        user: req.user._id,
        type,
        item,
        typeModel: computedTypeModel,
        date,
        members,
        paymentIntentId: paymentIntentId || null,
        status: paymentIntentId ? 'confirmed' : 'pending'
    });

    try {
        const newBooking = await booking.save();

        // Dynamically fetch the item details to construct the receipt
        const mongoose = require('mongoose');
        const ItemModel = mongoose.model(computedTypeModel);
        let itemDetails = null;

        if (computedTypeModel === 'Temple') {
            itemDetails = await ItemModel.findById(item);
        } else {
            itemDetails = await ItemModel.findById(item).populate('temple', 'name location');
        }

        const itemName = itemDetails?.name || itemDetails?.title || computedTypeModel;
        const templeName = itemDetails?.temple?.name || (computedTypeModel === 'Temple' ? itemDetails?.name : 'N/A');
        const templeLocation = itemDetails?.temple?.location || (computedTypeModel === 'Temple' ? itemDetails?.location : '');
        const itemPrice = itemDetails?.price || 0;
        const totalBill = itemPrice * members;

        // Send confirmation email asynchronously
        sendEmail({
            email: req.user.email,
            subject: 'Booking Confirmation & Receipt - Temple Info System',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4ade80; text-align: center; margin-bottom: 30px;">Booking Confirmed!</h2>
                    
                    <p style="font-size: 16px;">Dear <strong>${req.user.name}</strong>,</p>
                    <p style="font-size: 16px;">Thank you for your booking. Your reservation for <strong>${itemName}</strong> is confirmed.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Temple:</td>
                                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${templeName}</td>
                            </tr>
                            ${templeLocation ? `
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Location:</td>
                                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${templeLocation}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Date:</td>
                                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(date).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Tickets/Members:</td>
                                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${members}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Billing Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${itemPrice > 0 ? `
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Price per ticket:</td>
                                <td style="padding: 8px 0; text-align: right;">₹${itemPrice}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-weight: bold; font-size: 18px;">Total Amount Paid:</td>
                                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #22c55e; font-size: 18px;">₹${totalBill}</td>
                            </tr>
                            ` : `
                            <tr>
                                <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Total Amount:</td>
                                <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #22c55e;">Free Registration</td>
                            </tr>
                            `}
                            <tr>
                                <td style="padding: 16px 0 8px 0; color: #64748b; font-size: 12px;">Transition ID:</td>
                                <td style="padding: 16px 0 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${paymentIntentId || newBooking._id.toString()}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
                        You can view or manage your bookings anytime in your <a href="http://localhost:5173/profile" style="color: #3b82f6;">Profile</a>.
                    </p>
                </div>
            `
        });

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

        // Enforce 5-minute cancellation window (unless admin)
        if (req.user.role !== 'admin' && (Date.now() - new Date(booking.createdAt).getTime() > 5 * 60 * 1000)) {
            return res.status(400).json({ message: 'Cancellation window (5 minutes) has expired.' });
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Refund through Stripe if payment intent exists
        if (booking.paymentIntentId) {
            try {
                const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
                await stripe.refunds.create({
                    payment_intent: booking.paymentIntentId,
                });
            } catch (stripeErr) {
                console.error('Stripe Refund Error:', stripeErr);
                return res.status(500).json({ message: 'Failed to process refund with Stripe. ' + stripeErr.message });
            }
        }

        booking.status = 'cancelled';
        const updatedBooking = await booking.save();

        // Send cancellation email asynchronously
        sendEmail({
            email: req.user.email,
            subject: 'Booking Cancelled - Temple Info System',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Booking Cancelled</h2>
                    <p>Hi ${req.user.name}, your booking has been successfully cancelled.</p>
                    ${booking.paymentIntentId ? '<p>A full refund has been initiated to your original payment method. It may take 5-10 business days to appear.</p>' : ''}
                    <p>We hope to serve you again soon.</p>
                </div>
            `
        });

        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update booking status (Admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`Updating booking ${req.params.id} status to: ${status}`); // Debug log
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            console.log('Booking not found');
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        const updatedBooking = await booking.save();
        console.log('Booking updated successfully:', updatedBooking);
        res.json(updatedBooking);
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
