const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seva = require('./models/Seva');
const Booking = require('./models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        testAggregation();
    })
    .catch(err => console.log(err));

const testAggregation = async () => {
    try {
        const sevas = await Seva.find({});
        console.log(`Found ${sevas.length} sevas.`);

        for (const seva of sevas) {
            console.log(`\nChecking Seva: ${seva.name} (${seva._id})`);

            // Raw count
            const rawCount = await Booking.countDocuments({ item: seva._id });
            console.log(`- Raw Booking Documents: ${rawCount}`);

            // Aggregation
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

            const aggCount = result.length > 0 ? result[0].totalTickets : 0;
            console.log(`- Aggregated Ticket Count: ${aggCount}`);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
