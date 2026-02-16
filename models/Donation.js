const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    temple: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temple',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'Card' // For now, defaulting to Card as we don't have real payment gateway
    },
    status: {
        type: String,
        enum: ['completed', 'failed'],
        default: 'completed'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
