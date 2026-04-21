const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seva = require('./models/Seva');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        migrateSevas();
    })
    .catch(err => console.log(err));

const migrateSevas = async () => {
    try {
        console.log('Migrating Sevas: Converting ticketLimit 0 to null/undefined...');

        // Update all documents where ticketLimit is 0
        // We will unset it or set to null. Mongoose might handle null better if field is defined Number.
        // If type is Number, null is valid.

        const result = await Seva.updateMany(
            { ticketLimit: 0 },
            { $unset: { ticketLimit: "" } } // Unset removing the field effectively making it undefined/null
        );

        console.log(`Modified ${result.modifiedCount} sevas.`);
        console.log('Migration completed.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
