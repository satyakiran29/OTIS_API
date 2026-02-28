const Booking = require('../models/Booking');
const sendEmail = require('./sendEmail');
const mongoose = require('mongoose');

const startAutoConfirmJob = () => {
    // Run every 30 seconds to check for bookings to confirm
    setInterval(async () => {
        try {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

            // Find bookings that are pending, type seva, and older than 1 minute
            const pendingBookings = await Booking.find({
                status: 'pending',
                type: 'seva',
                createdAt: { $lte: oneMinuteAgo }
            }).populate('user', 'name email').populate({
                path: 'item',
                populate: { path: 'temple', select: 'name location' }
            });

            if (pendingBookings.length > 0) {
                for (const booking of pendingBookings) {
                    // Update status
                    booking.status = 'confirmed';
                    await booking.save();

                    // Details for email
                    const itemDetails = booking.item;
                    const itemName = itemDetails?.name || itemDetails?.title || 'Seva';
                    const templeName = itemDetails?.temple?.name || 'N/A';
                    const templeLocation = itemDetails?.temple?.location || '';
                    const itemPrice = itemDetails?.price || 0;
                    const totalBill = itemPrice * booking.members;
                    const transactionId = booking.paymentIntentId || booking._id.toString();

                    // Send email
                    sendEmail({
                        email: booking.user.email,
                        subject: 'Seva Booking Confirmed - Temple Info System',
                        html: `
                            <div style="font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #4ade80; text-align: center; margin-bottom: 30px;">Seva Booking Confirmed!</h2>
                                
                                <p style="font-size: 16px;">Dear <strong>${booking.user.name}</strong>,</p>
                                <p style="font-size: 16px;">Your Seva reservation for <strong>${itemName}</strong> has been successfully confirmed.</p>
                                
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
                                            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(booking.date).toLocaleDateString()}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #64748b;">No. of Tickets:</td>
                                            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${booking.members}</td>
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
                                            <td style="padding: 8px 0; color: #64748b; font-weight: bold; font-size: 18px;">Total Amount:</td>
                                            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #22c55e; font-size: 18px;">₹${totalBill}</td>
                                        </tr>
                                        ` : `
                                        <tr>
                                            <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Total Amount:</td>
                                            <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #22c55e;">Free / Donation</td>
                                        </tr>
                                        `}
                                        <tr>
                                            <td style="padding: 16px 0 8px 0; color: #64748b; font-size: 12px;">Transition ID:</td>
                                            <td style="padding: 16px 0 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${transactionId}</td>
                                        </tr>
                                    </table>
                                </div>

                                <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
                                    You can view your bookings anytime in your Profile.
                                </p>
                            </div>
                        `
                    });
                }
                console.log(`Auto-confirmed ${pendingBookings.length} seva bookings and sent emails.`);
            }
        } catch (error) {
            console.error('Error in auto-confirm job:', error);
        }
    }, 30000); // Check every 30 seconds
};

module.exports = startAutoConfirmJob;
