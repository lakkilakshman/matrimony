const nodemailer = require('nodemailer');
const { query } = require('../config/database');

/**
 * Get SMTP settings from database
 */
const getSMTPSettings = async () => {
    try {
        const rows = await query(
            "SELECT setting_key, setting_value FROM system_settings WHERE setting_key LIKE 'smtp_%'"
        );

        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        return settings;
    } catch (error) {
        console.error('Error fetching SMTP settings:', error);
        return null;
    }
};

/**
 * Create transporter with dynamic settings
 */
const createTransporter = async () => {
    const settings = await getSMTPSettings();

    if (!settings || !settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
        console.warn('SMTP settings are missing or incomplete in database.');
        // Fallback to env vars if DB settings missing (optional, but good for backward compat)
        if (process.env.SMTP_HOST) {
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_PORT == 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        }
        return null;
    }

    return nodemailer.createTransport({
        host: settings.smtp_host,
        port: parseInt(settings.smtp_port) || 587,
        secure: parseInt(settings.smtp_port) === 465,
        auth: {
            user: settings.smtp_user,
            pass: settings.smtp_pass
        }
    });
};

/**
 * Handle template variables replacement
 * @param {string} template 
 * @param {object} data 
 * @returns {string}
 */
const replacePlaceholders = (template, data) => {
    let content = template;
    for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(placeholder, value || '');
    }
    return content;
};

/**
 * Send email using a template slug
 * @param {string} to - Recipient email
 * @param {string} slug - Template slug
 * @param {object} data - Data to replace placeholders
 */
const sendEmailTemplate = async (to, slug, data) => {
    try {
        console.log(`[Email] Attempting to send email with template: ${slug} to: ${to}`);

        const transporter = await createTransporter();

        if (!transporter) {
            console.error('[Email] Email transporter could not be initialized. Check SMTP settings.');
            return false;
        }

        console.log('[Email] Transporter created successfully');

        // Fetch template
        const templates = await query(
            'SELECT subject, body FROM email_templates WHERE slug = ? AND is_active = TRUE',
            [slug]
        );

        if (templates.length === 0) {
            console.error(`[Email] Template with slug "${slug}" not found or inactive.`);
            return false;
        }

        console.log(`[Email] Template "${slug}" found`);

        const template = templates[0];
        const subject = replacePlaceholders(template.subject, data);
        const htmlBody = replacePlaceholders(template.body, data);

        // Get sender info
        const settings = await getSMTPSettings();
        const fromName = settings?.smtp_from_name || 'Merukayana Matrimony';
        const fromEmail = settings?.smtp_from_email || settings?.smtp_user || process.env.SMTP_USER;

        console.log(`[Email] Sending from: "${fromName}" <${fromEmail}>`);

        // Send email
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html: htmlBody
        };

        console.log('[Email] Attempting to send mail...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] ✅ Email sent successfully: ${info.messageId} (Template: ${slug})`);
        return true;
    } catch (error) {
        console.error(`[Email] ❌ Error sending email (Template: ${slug}):`, error.message);
        console.error('[Email] Full error:', error);
        return false;
    }
};

module.exports = {
    sendEmailTemplate
};
