const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seva = require('./models/Seva');
const Booking = require('./models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        checkSevaValues();
    })
    .catch(err => console.log(err));

const checkSevaValues = async () => {
    try {
        const sevas = await Seva.find({});

        for (const seva of sevas) {
            // Replicate backend logic
            const result = await Booking.aggregate([
                {
                    $match: {
                        item: seva._id,
                        status: { $in: ['confirmed', 'pending'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTickets: { $sum: "$members" }
                    }
                }
            ]);

            const bookedCount = result.length > 0 ? result[0].totalTickets : 0;
            const availableTickets = Math.max(0, seva.ticketLimit - bookedCount);

            console.log(`\nSeva: ${seva.name}`);
            console.log(`- ticketLimit (DB): ${seva.ticketLimit}`);
            console.log(`- bookedCount (Calculated): ${bookedCount}`);
            console.log(`- availableTickets (Calculated): ${availableTickets}`);
            console.log(`- SAME? ${seva.ticketLimit === bookedCount}`);
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
