const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seva = require('./models/Seva');
const Booking = require('./models/Booking');
const User = require('./models/User'); // Assuming User model exists

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        testBookingCreation();
    })
    .catch(err => console.log(err));

const testBookingCreation = async () => {
    try {
        // 1. Find a Seva
        const seva = await Seva.findOne();
        if (!seva) {
            console.log('No Seva found to book.');
            process.exit(1);
        }
        console.log(`Booking for Seva: ${seva.name} (${seva._id})`);

        // 2. Find a User (or create dummy if needed, but assuming one exists)
        // If auth requires user, we need a user ID.
        // Let's create a dummy booking directly using the model to test schema/validation first.
        // The API route calls `new Booking(...)`.

        const bookingData = {
            user: new mongoose.Types.ObjectId(), // Mock user ID
            type: 'seva', // Required field
            item: seva._id,
            typeModel: 'Seva',
            date: new Date(),
            members: 2,
            devotee: 'Test Devotee',
            status: 'confirmed'
        };

        console.log('Attempting to create booking with data:', bookingData);

        const booking = new Booking(bookingData);
        await booking.save();

        console.log('Booking saved successfully:', booking._id);

        // Verify count
        const count = await Booking.countDocuments({ item: seva._id });
        console.log(`Count for Seva ${seva._id} is now: ${count}`);

        process.exit();
    } catch (error) {
        console.error('Error creating booking:', error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};
