const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Stripe Webhook needs the raw body to verify signature
app.use('/api/webhook', express.raw({ type: 'application/json' }), require('./routes/stripeWebhooks'));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Serve static files from the public directory
app.use(express.static('public'));

// Ping route to keep server awake
app.get('/ping', (req, res) => {
    res.status(200).send('API is awake!');
});

// Routes
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

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
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chat', require('./routes/chat'));

// Start background jobs
const startAutoConfirmJob = require('./utils/autoConfirmBookings');
startAutoConfirmJob();

const startKeepAliveJob = require('./utils/keepAlive');
startKeepAliveJob();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
