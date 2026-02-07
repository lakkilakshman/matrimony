const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getSentInterests,
    getReceivedInterests,
    sendInterest,
    acceptInterest,
    rejectInterest
} = require('../controllers/interestsController');

// All routes require authentication
router.use(authenticateToken);

router.get('/sent', getSentInterests);
router.get('/received', getReceivedInterests);
router.post('/:profileId', sendInterest);
router.put('/:id/accept', acceptInterest);
router.put('/:id/reject', rejectInterest);

module.exports = router;
