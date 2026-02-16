const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        const users = await User.find({}, 'name email role');
        console.log('Users:', users);
        process.exit();
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
