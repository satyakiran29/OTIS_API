const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['AC', 'Non-AC', 'Suite', 'Dormitory'],
        default: 'Non-AC'
    },
    price: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    temple: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temple',
        required: true
    },
    amenities: {
        type: [String],
        default: []
    },
    image: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Accommodation', accommodationSchema);
