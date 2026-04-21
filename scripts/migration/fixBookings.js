const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        fixBookings();
    })
    .catch(err => console.log(err));

const fixBookings = async () => {
    try {
        console.log('Starting migration...');

        // Find bookings with missing members or members = 0
        const bookingsToFix = await Booking.find({
            $or: [
                { members: { $exists: false } },
                { members: null },
                { members: 0 }
            ]
        });

        console.log(`Found ${bookingsToFix.length} bookings to fix.`);

        let count = 0;
        for (const booking of bookingsToFix) {
            booking.members = 1;
            await booking.save();
            count++;
            process.stdout.write(`\rFixed ${count} bookings`);
        }

        console.log('\nMigration completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
