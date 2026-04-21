const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address as an argument.');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`User ${user.name} (${user.email}) is now an Admin.`);
        process.exit();
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
