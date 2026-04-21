const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        checkTypes();
    })
    .catch(err => console.log(err));

const checkTypes = async () => {
    try {
        console.log('Checking member types...');
        const bookings = await Booking.find({});
        let stringCount = 0;

        for (const booking of bookings) {
            if (typeof booking.members === 'string') {
                console.log(`Booking ${booking._id} has members as string: "${booking.members}"`);
                stringCount++;
                // Fix it
                booking.members = parseInt(booking.members);
                await booking.save();
            }
        }

        if (stringCount === 0) {
            console.log('All bookings have number type for members.');
        } else {
            console.log(`Fixed ${stringCount} bookings with string members.`);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
