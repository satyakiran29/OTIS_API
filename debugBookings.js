const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seva = require('./models/Seva');
const Booking = require('./models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        debugBookings();
    })
    .catch(err => console.log(err));

const debugBookings = async () => {
    try {
        console.log('Connected to DB:', mongoose.connection.name);

        const sevas = await Seva.find({});
        console.log(`Found ${sevas.length} sevas.`);
        sevas.forEach(s => console.log(`Seva: ${s.name} (${s._id})`));

        const bookings = await Booking.find({});
        console.log(`\nFound ${bookings.length} TOTAL bookings in DB.`);

        bookings.forEach(b => {
            console.log(`Booking: ${b._id}, Item: ${b.item} (Type: ${typeof b.item}), Status: ${b.status}, Members: ${b.members}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
