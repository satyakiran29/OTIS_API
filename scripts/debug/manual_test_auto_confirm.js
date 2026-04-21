const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Create a dummy expired pending seva booking
        const testBooking = new Booking({
            user: new mongoose.Types.ObjectId(), // Fake user ID
            type: 'seva',
            typeModel: 'Seva', // Required by schema
            item: new mongoose.Types.ObjectId(), // Fake item ID
            date: new Date(),
            status: 'pending',
            members: 1,
            // access createdAt by manually setting it? 
            // Mongoose timestamps are set on save. We can override if we use create or insertMany maybe?
            // Or just rely on the fact that if we create it now, we need our query to look for "future" or we manipulate the query?
            // Easier: Create it, then update its createdAt using findOneAndUpdate to be in the past.
        });

        const savedBooking = await testBooking.save();
        console.log('Created test booking:', savedBooking._id);

        // Manually age the booking to 2 minutes ago
        const twoMinutesAgo = new Date(Date.now() - 120 * 1000);
        await Booking.collection.updateOne({ _id: savedBooking._id }, { $set: { createdAt: twoMinutesAgo } });
        console.log('Aged booking to:', twoMinutesAgo);

        const checkBooking = await Booking.findById(savedBooking._id);
        console.log('Booking state before auto-confirm:', {
            id: checkBooking._id,
            status: checkBooking.status,
            type: checkBooking.type,
            createdAt: checkBooking.createdAt
        });

        // 2. Run the exact logic from autoConfirmBookings.js
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        console.log('Running update for bookings older than:', oneMinuteAgo);

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

        console.log('Update result:', result);

        // 3. Verify
        const updatedBooking = await Booking.findById(savedBooking._id);
        if (updatedBooking.status === 'confirmed') {
            console.log('SUCCESS: Booking was auto-confirmed!');
        } else {
            console.error('FAILURE: Booking is still', updatedBooking.status);
        }

        // 4. Cleanup
        await Booking.deleteOne({ _id: savedBooking._id });
        console.log('Cleanup done.');

        process.exit(0);

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

runTest();
