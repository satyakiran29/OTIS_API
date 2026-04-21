const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/otis_db').then(async () => { 
    try {
        const Temple = mongoose.connection.db.collection('temples');
        // Update the specific temple they are viewing
        const result = await Temple.updateOne(
            { _id: new mongoose.Types.ObjectId('69b6f934e2ee1b7f824e3b0c') },
            { 
                $set: { 
                    "coordinates.lat": 18.466212403240238, 
                    "coordinates.lon": 83.66627560418593,
                    "location": "Srimukhalingam Temple, Andhra Pradesh" 
                } 
            }
        );
        console.log("Update result:", result.modifiedCount);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
});
