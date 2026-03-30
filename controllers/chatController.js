const { generateChatResponse } = require('../services/chatService');

// @desc    Process a chat message
// @route   POST /api/chat
// @access  Public
const processChatMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Chat message string is required' });
    }

    try {
        const botReply = await generateChatResponse(message);
        res.status(200).json({ reply: botReply });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process chat message on server' });
    }
};

module.exports = { processChatMessage };
