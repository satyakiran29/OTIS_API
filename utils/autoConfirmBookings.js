const Booking = require('../models/Booking');

const startAutoConfirmJob = () => {
    // Run every 30 seconds to check for bookings to confirm
    setInterval(async () => {
        try {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

            // Find bookings that are:
            // 1. Pending
            // 2. Type is 'seva' (as requested)
            // 3. Created more than 1 minute ago
            const result = await Booking.updateMany(
                {
                    status: 'pending',
                    type: 'seva',
                    createdAt: { $lte: oneMinuteAgo }
                },
                {
                    $set: { status: 'confirmed' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`Auto-confirmed ${result.modifiedCount} seva bookings.`);
            }
        } catch (error) {
            console.error('Error in auto-confirm job:', error);
        }
    }, 30000); // Check every 30 seconds
};

module.exports = startAutoConfirmJob;
