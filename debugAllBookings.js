const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Seva = require('./models/Seva');
const Temple = require('./models/Temple');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        checkAllBookings();
    })
    .catch(err => console.log(err));

const checkAllBookings = async () => {
    try {
        console.log('Fetching ALL bookings...');

        const bookings = await Booking.find()
            .populate({
                path: 'item',
                populate: { path: 'temple', select: 'name' }
            });

        console.log(`Found ${bookings.length} bookings.`);

        let naCount = 0;
        bookings.forEach(booking => {
            let templeName = 'N/A';

            if (booking.typeModel === 'Temple') {
                templeName = booking.item?.name || 'N/A';
            } else {
                templeName = booking.item?.temple?.name || booking.item?.temple?.title || 'N/A';
            }

            console.log(`ID: ${booking._id} | Type: ${booking.typeModel} | Item: ${booking.item?.name} | Temple: ${templeName}`);

            if (templeName === 'N/A') {
                naCount++;
                console.log('--- DETAILS FOR N/A ---');
                console.log('Item:', booking.item);
                if (booking.item) {
                    console.log('Item Temple:', booking.item.temple);
                }
                console.log('-----------------------');
            }
        });

        console.log(`\nTotal N/A Temples: ${naCount}`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
