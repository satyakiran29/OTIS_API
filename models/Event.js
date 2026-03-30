const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an event name'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    category: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Annual'],
        required: [true, 'Please select a category'],
    },
    date: {
        type: Date,
        required: [true, 'Please add a date'],
    },
    time: {
        type: String,
    },
    location: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    temple: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temple',
        required: [true, 'Please associate this event with a temple'],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
