const mongoose = require('mongoose');
console.log("Testing MongoDB connection on 127.0.0.1:27017...");
mongoose.connect('mongodb://127.0.0.1:27017/temple_auth', {
    serverSelectionTimeoutMS: 2000 // Error out quickly if down
})
  .then(() => {
    console.log("SUCCESS: MongoDB is running and connected!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAIL: Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
