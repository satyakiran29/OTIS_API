const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    temple: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temple',
        required: false // events might not strictly be tied to a specific temple in the generic list
    },
    image: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
