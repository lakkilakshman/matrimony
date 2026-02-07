const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// All setting routes require admin access
router.get('/', authenticateToken, isAdmin, getSettings);
router.put('/', authenticateToken, isAdmin, updateSettings);

module.exports = router;
