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
        debugBookingPopulate();
    })
    .catch(err => console.log(err));

const debugBookingPopulate = async () => {
    try {
        console.log('Fetching one booking with full population...');

        const booking = await Booking.findOne()
            .populate('user', 'name email')
            .populate({
                path: 'item',
                populate: { path: 'temple', select: 'name' }
            });

        if (!booking) {
            console.log('No bookings found.');
        } else {
            console.log('Booking Structure:');
            console.log(JSON.stringify(booking, null, 2));

            console.log('------------------------------------------------');
            console.log('Check:');
            console.log(`- typeModel: ${booking.typeModel}`);
            console.log(`- item exists? ${!!booking.item}`);
            if (booking.item) {
                console.log(`- item.name: ${booking.item.name}`);
                console.log(`- item.title: ${booking.item.title}`);
                console.log(`- item.temple exists? ${!!booking.item.temple}`);
                if (booking.item.temple) {
                    console.log(`- item.temple (Type): ${typeof booking.item.temple}`);
                    console.log(`- item.temple.name: ${booking.item.temple.name}`);
                }
            }
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
