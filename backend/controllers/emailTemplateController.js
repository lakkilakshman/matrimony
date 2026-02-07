const { query } = require('../config/database');

// Get all templates
const getAllTemplates = async (req, res) => {
    try {
        const templates = await query('SELECT * FROM email_templates ORDER BY name ASC');
        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Get all templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch email templates'
        });
    }
};

// Update a template
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, body, is_active } = req.body;

        if (!subject || !body) {
            return res.status(400).json({
                success: false,
                message: 'Subject and body are required'
            });
        }

        await query(
            'UPDATE email_templates SET subject = ?, body = ?, is_active = ? WHERE id = ?',
            [subject, body, is_active !== undefined ? is_active : true, id]
        );

        res.json({
            success: true,
            message: 'Template updated successfully'
        });
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template'
        });
    }
};

// Get template by slug
const getTemplateBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const templates = await query('SELECT * FROM email_templates WHERE slug = ?', [slug]);

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.json({
            success: true,
            data: templates[0]
        });
    } catch (error) {
        console.error('Get template by slug error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch template'
        });
    }
};

const { sendEmailTemplate } = require('../utils/emailService');

// ... existing code ...

// Send a test email
const sendTestEmail = async (req, res) => {
    console.log('[Controller] sendTestEmail called');
    console.log('[Controller] Params:', req.params);
    console.log('[Controller] Body:', req.body);

    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
            console.log('[Controller] No email provided');
            return res.status(400).json({
                success: false,
                message: 'Recipient email is required'
            });
        }

        console.log(`[Controller] Fetching template with ID: ${id}`);

        // Get template slug
        const templates = await query('SELECT slug, subject, body FROM email_templates WHERE id = ?', [id]);

        if (templates.length === 0) {
            console.log('[Controller] Template not found');
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const template = templates[0];
        console.log(`[Controller] Template found: ${template.slug}`);

        // Mock data for placeholders
        const mockData = {
            name: 'Test User',
            otp: '123456',
            sender_name: 'John Doe',
            receiver_name: 'Jane Smith',
            link: 'http://localhost:3000/dashboard'
        };

        console.log(`[Controller] Calling sendEmailTemplate for ${email}`);
        const result = await sendEmailTemplate(email, template.slug, mockData);
        console.log(`[Controller] sendEmailTemplate result: ${result}`);

        if (result) {
            console.log('[Controller] ✅ Test email sent successfully');
            res.json({
                success: true,
                message: `Test email sent to ${email}`
            });
        } else {
            console.log('[Controller] ❌ Email sending failed');
            res.status(500).json({
                success: false,
                message: 'Failed to send test email'
            });
        }
    } catch (error) {
        console.error('[Controller] ❌ Error in sendTestEmail:', error.message);
        console.error('[Controller] Full error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email'
        });
    }
};

module.exports = {
    getAllTemplates,
    updateTemplate,
    getTemplateBySlug,
    sendTestEmail
};
