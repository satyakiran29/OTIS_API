const mongoose = require('mongoose');
const Temple = require('./models/Temple');

require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/otis_db', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(async () => {
    try {
        const temples = await Temple.find({});
        if (temples.length > 0) {
            // Let's update Srimukhalingam Temple specifically or just the first one
            const temple = temples.find(t => t.name.includes("Srimukhalingam")) || temples[0];
            temple.coordinates = { lat: 18.466212403240238, lon: 83.66627560418593 };
            temple.location = "18.466212403240238, 83.66627560418593";
            await temple.save();
            console.log(`Successfully updated coordinates for: ${temple.name}`);
        } else {
            console.log("No temples found in the database.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})
.catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
});
