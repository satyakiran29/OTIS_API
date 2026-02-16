const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

const templeRoutes = require('./routes/temples');
const authRoutes = require('./routes/auth');

app.use('/api/temples', templeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/sevas', require('./routes/sevas'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/accommodations', require('./routes/accommodations'));
app.use('/api/users', require('./routes/users'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
