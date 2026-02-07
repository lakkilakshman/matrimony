const { query } = require('../config/database');

// Get user's favorites
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await query(
            `SELECT p.*, f.created_at as favorited_at,
              l.city, l.state,
              pd.occupation_category, pd.annual_income,
              ed.education_level
       FROM favorites f
       INNER JOIN profiles p ON f.profile_id = p.id
       INNER JOIN users u ON p.user_id = u.id
       LEFT JOIN location_details l ON p.id = l.profile_id
       LEFT JOIN professional_details pd ON p.id = pd.profile_id
       LEFT JOIN education_details ed ON p.id = ed.profile_id
       WHERE f.user_id = ? AND u.status = 'active' AND p.profile_status = 'verified'
       ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favorites'
        });
    }
};

// Add to favorites
const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = req.params.profileId;

        // Check if profile exists
        const profiles = await query(
            'SELECT id FROM profiles WHERE id = ?',
            [profileId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Add to favorites
        await query(
            'INSERT INTO favorites (user_id, profile_id) VALUES (?, ?)',
            [userId, profileId]
        );

        res.json({
            success: true,
            message: 'Added to favorites successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Profile already in favorites'
            });
        }
        console.error('Add to favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to favorites'
        });
    }
};

// Remove from favorites
const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = req.params.profileId;

        const result = await query(
            'DELETE FROM favorites WHERE user_id = ? AND profile_id = ?',
            [userId, profileId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Favorite not found'
            });
        }

        res.json({
            success: true,
            message: 'Removed from favorites successfully'
        });
    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove from favorites'
        });
    }
};

// Check if profile is favorited
const checkFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = req.params.profileId;

        const favorites = await query(
            'SELECT id FROM favorites WHERE user_id = ? AND profile_id = ?',
            [userId, profileId]
        );

        res.json({
            success: true,
            data: {
                isFavorited: favorites.length > 0
            }
        });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check favorite status'
        });
    }
};

module.exports = {
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    checkFavorite
};
