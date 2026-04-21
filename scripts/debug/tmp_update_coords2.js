const mongoose = require('mongoose');
const Temple = require('./models/Temple');

mongoose.connect('mongodb://127.0.0.1:27017/otis_db')
.then(async () => {
    try {
        const temple = await Temple.findOne({});
        if (temple) {
            temple.coordinates = { lat: 18.466212403240238, lon: 83.66627560418593 };
            temple.location = "18.466212403240238, 83.66627560418593";
            await temple.save();
            console.log(`Successfully updated coordinates for: ${temple.name} with ID: ${temple._id}`);
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
