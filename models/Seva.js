const mongoose = require('mongoose');

const sevaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    temple: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temple',
        required: true
    },
    duration: { // e.g., "30 mins", "1 hour"
        type: String
    },
    ticketLimit: {
        type: Number,
        required: true,
        default: 100
    }
}, { timestamps: true });

module.exports = mongoose.model('Seva', sevaSchema);
