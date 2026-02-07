const { query } = require('../config/database');

// Get all form field options (grouped by field name)
const getAllFieldOptions = async (req, res) => {
    try {
        const results = await query(
            `SELECT id, field_name, option_value, option_label, display_order 
             FROM form_field_options 
             WHERE is_active = TRUE 
             ORDER BY field_name, display_order`,
            []
        );

        // Group by field name
        const groupedOptions = {};
        results.forEach(row => {
            if (!groupedOptions[row.field_name]) {
                groupedOptions[row.field_name] = [];
            }
            groupedOptions[row.field_name].push({
                id: row.id,
                value: row.option_value,
                label: row.option_label,
                order: row.display_order
            });
        });

        res.json({
            success: true,
            data: groupedOptions
        });
    } catch (error) {
        console.error('Get all field options error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch form field options'
        });
    }
};

// Get options for a specific field
const getFieldOptions = async (req, res) => {
    try {
        const { fieldName } = req.params;

        const results = await query(
            `SELECT id, option_value, option_label, display_order 
             FROM form_field_options 
             WHERE field_name = ? AND is_active = TRUE 
             ORDER BY display_order`,
            [fieldName]
        );

        res.json({
            success: true,
            data: results.map(row => ({
                id: row.id,
                value: row.option_value,
                label: row.option_label,
                order: row.display_order
            }))
        });
    } catch (error) {
        console.error('Get field options error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch field options'
        });
    }
};

// Add new field option (admin only)
const addFieldOption = async (req, res) => {
    try {
        const { fieldName, optionValue, optionLabel } = req.body;

        if (!fieldName || !optionValue || !optionLabel) {
            return res.status(400).json({
                success: false,
                message: 'Field name, value, and label are required'
            });
        }

        // Check if option already exists (including soft-deleted ones)
        const existingOption = await query(
            'SELECT id, is_active FROM form_field_options WHERE field_name = ? AND option_value = ?',
            [fieldName, optionValue]
        );

        if (existingOption.length > 0) {
            const option = existingOption[0];

            if (option.is_active) {
                return res.status(400).json({
                    success: false,
                    message: 'This option already exists for this field'
                });
            } else {
                // Reactivate the soft-deleted option
                await query(
                    'UPDATE form_field_options SET is_active = TRUE, option_label = ? WHERE id = ?',
                    [optionLabel, option.id]
                );

                return res.json({
                    success: true,
                    message: 'Field option restored successfully',
                    data: {
                        id: option.id,
                        fieldName,
                        value: optionValue,
                        label: optionLabel,
                        order: 0 // Order might be messed up but better than failure
                    }
                });
            }
        }

        // Get max display order for this field
        const maxOrderResult = await query(
            'SELECT MAX(display_order) as max_order FROM form_field_options WHERE field_name = ?',
            [fieldName]
        );
        const nextOrder = (maxOrderResult[0].max_order || 0) + 1;

        // Insert new option
        const result = await query(
            `INSERT INTO form_field_options (field_name, option_value, option_label, display_order) 
             VALUES (?, ?, ?, ?)`,
            [fieldName, optionValue, optionLabel, nextOrder]
        );

        res.json({
            success: true,
            message: 'Field option added successfully',
            data: {
                id: result.insertId,
                fieldName,
                value: optionValue,
                label: optionLabel,
                order: nextOrder
            }
        });
    } catch (error) {
        console.error('Add field option error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add field option'
        });
    }
};

// Update field option (admin only)
const updateFieldOption = async (req, res) => {
    try {
        const { id } = req.params;
        const { optionLabel } = req.body;

        if (!optionLabel) {
            return res.status(400).json({
                success: false,
                message: 'Option label is required'
            });
        }

        await query(
            'UPDATE form_field_options SET option_label = ? WHERE id = ?',
            [optionLabel, id]
        );

        res.json({
            success: true,
            message: 'Field option updated successfully'
        });
    } catch (error) {
        console.error('Update field option error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update field option'
        });
    }
};

// Delete field option (admin only) - soft delete
const deleteFieldOption = async (req, res) => {
    try {
        const { id } = req.params;

        await query(
            'UPDATE form_field_options SET is_active = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Field option deleted successfully'
        });
    } catch (error) {
        console.error('Delete field option error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete field option'
        });
    }
};

module.exports = {
    getAllFieldOptions,
    getFieldOptions,
    addFieldOption,
    updateFieldOption,
    deleteFieldOption
};
