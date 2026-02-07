const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    checkFavorite
} = require('../controllers/favoritesController');

// All routes require authentication
router.use(authenticateToken);

router.get('/', getFavorites);
router.post('/:profileId', addToFavorites);
router.delete('/:profileId', removeFromFavorites);
router.get('/:profileId/check', checkFavorite);

module.exports = router;
