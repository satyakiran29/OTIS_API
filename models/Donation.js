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
    donorName: { type: String, required: true },
    gothram: { type: String },
    occasion: { type: String },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    zipcode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    mobile: { type: String, required: true },

    donationDate: { type: Date },
    paymentMethod: {
        type: String,
        default: 'Card'
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
