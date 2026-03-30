const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    const { templeId } = req.query;
    try {
        const query = templeId ? { temple: templeId } : {};
        const events = await Event.find(query).sort({ date: 1 }).populate('temple', 'name location');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            res.status(200).json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    const { name, description, category, date, time, location, imageUrl, temple } = req.body;
    const userId = req.user._id;

    try {
        // Check if user is restricted to a specific temple
        if (req.user.temple && req.user.temple.toString() !== temple) {
            return res.status(403).json({ message: 'Not authorized to manage events for this temple.' });
        }

        const event = new Event({
            name,
            description,
            category,
            date,
            time,
            location,
            imageUrl,
            temple,
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    const { name, description, category, date, time, location, imageUrl, temple } = req.body;
    const userId = req.user._id;

    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Check if user is restricted to a specific temple
            if (req.user.temple && req.user.temple.toString() !== event.temple.toString()) {
                return res.status(403).json({ message: 'Not authorized to manage events for this temple.' });
            }

            event.name = name || event.name;
            event.description = description || event.description;
            event.category = category || event.category;
            event.date = date || event.date;
            event.time = time || event.time;
            event.location = location || event.location;
            event.imageUrl = imageUrl || event.imageUrl;
            event.temple = temple || event.temple;

            const updatedEvent = await event.save();
            res.status(200).json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Check if user is restricted to a specific temple
            if (req.user.temple && req.user.temple.toString() !== event.temple.toString()) {
                return res.status(403).json({ message: 'Not authorized to manage events for this temple.' });
            }

            await event.deleteOne();
            res.status(200).json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};
