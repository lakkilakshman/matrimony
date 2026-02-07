const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
    getAllTemplates,
    updateTemplate,
    getTemplateBySlug,
    sendTestEmail
} = require('../controllers/emailTemplateController');

// All routes require admin privileges
router.use(authenticateToken, isAdmin);

router.get('/', getAllTemplates);
router.get('/:slug', getTemplateBySlug);
router.put('/:id', updateTemplate);
router.post('/:id/test', sendTestEmail);

module.exports = router;
