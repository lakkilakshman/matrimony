const { query } = require('../config/database');

// Get all application settings
const getSettings = async (req, res) => {
    try {
        const rows = await query('SELECT setting_key, setting_value FROM system_settings');

        // Convert array of rows to a single object
        const settings = {};
        rows.forEach(row => {
            let value = row.setting_value;
            // Handle boolean strings
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            // Handle number strings for start number
            if (row.setting_key === 'matrimony_id_start_number') value = parseInt(value) || 1;

            settings[row.setting_key] = value;
        });

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
};

// Update multiple settings at once
const updateSettings = async (req, res) => {
    try {
        const settings = req.body; // Object with key-value pairs

        const updatePromises = Object.entries(settings).map(([key, value]) => {
            // Convert everything to string for storage
            const stringValue = String(value);
            return query(
                'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
                [stringValue, key]
            );
        });

        await Promise.all(updatePromises);

        // Log the action
        await query(
            'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
            [req.user.id, 'update_settings', 'Updated system preferences']
        );

        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
