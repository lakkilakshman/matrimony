const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
    getAllFieldOptions,
    getFieldOptions,
    addFieldOption,
    updateFieldOption,
    deleteFieldOption
} = require('../controllers/formFieldsController');

// Public route - get all form field options (for registration forms)
router.get('/', getAllFieldOptions);

// Public route - get options for specific field
router.get('/:fieldName', getFieldOptions);

// Admin routes - manage field options
router.post('/', authenticateToken, isAdmin, addFieldOption);
router.put('/:id', authenticateToken, isAdmin, updateFieldOption);
router.delete('/:id', authenticateToken, isAdmin, deleteFieldOption);

module.exports = router;
