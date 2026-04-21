const { MongoClient } = require('mongodb');

async function run() {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    try {
        await client.connect();
        const db = client.db('otis_db');
        const collection = db.collection('temples');
        
        // Find Srimukhalingam Temple
        const query = { name: { $regex: 'Srimukhalingam', $options: 'i' } };
        const update = {
            $set: {
                "coordinates": {
                    "lat": 18.466212403240238,
                    "lon": 83.66627560418593
                },
                "location": "Srimukhalingam Temple, Andhra Pradesh"
            }
        };
        
        let result = await collection.updateOne(query, update);
        
        if (result.modifiedCount > 0) {
            console.log("Updated Srimukhalingam successfully!");
        } else {
            console.log("Srimukhalingam not found or already up to date. Updating the first available temple instead...");
            const anyUpdate = await collection.updateOne({}, update);
            if (anyUpdate.modifiedCount > 0) {
                console.log("Updated FIRST available temple successfully! Check the UI.");
            } else {
                console.log("No temples available in DB to update.");
            }
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}
run();
