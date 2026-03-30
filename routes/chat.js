const express = require('express');
const router = express.Router();
const { processChatMessage } = require('../controllers/chatController');

router.post('/', processChatMessage);

module.exports = router;
