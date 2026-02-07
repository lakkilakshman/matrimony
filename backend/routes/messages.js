const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    sendMessage,
    getConversations,
    getMessages
} = require('../controllers/messageController');

// All routes require authentication
router.use(authenticateToken);

router.get('/conversations', getConversations);
router.get('/:otherUserId', getMessages);
router.post('/', sendMessage);

module.exports = router;
