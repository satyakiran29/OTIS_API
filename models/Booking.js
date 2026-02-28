const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['event', 'seva', 'darshan', 'accommodation'],
        required: true
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'typeModel'
    },
    typeModel: {
        type: String,
        required: true,
        enum: ['Event', 'Seva', 'Temple', 'Accommodation'] // 'Temple' for general darshan entries if applicable, or keep specific
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'], // Added completed
        default: 'pending'
    },
    members: {
        type: Number,
        default: 1
    },
    paymentIntentId: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
