const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Seva = require('./models/Seva');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        migrateUnlimitedToFinite();
    })
    .catch(err => console.log(err));

const migrateUnlimitedToFinite = async () => {
    try {
        console.log('Migrating Sevas: Converting null/undefined ticketLimit to 100 (Default Finite Limit)...');

        // Update all documents where ticketLimit is null or does not exist
        const result = await Seva.updateMany(
            { $or: [{ ticketLimit: null }, { ticketLimit: { $exists: false } }] },
            { $set: { ticketLimit: 100 } }
        );

        console.log(`Modified ${result.modifiedCount} sevas.`);
        console.log('Migration completed.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
