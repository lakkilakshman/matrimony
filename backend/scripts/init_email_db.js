const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function initEmailDb() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'merukayana_matrimony'
        });

        console.log('Connected to database to initialize email system.');

        // Create Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS email_templates (
                id INT PRIMARY KEY AUTO_INCREMENT,
                slug VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                body TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table "email_templates" ensured.');

        // Seed Templates
        const templates = [
            {
                slug: 'interest_received',
                name: 'Interest Received',
                subject: 'Someone is interested in your profile!',
                body: '<h3>Hello {{recipientName}},</h3><p>{{senderName}} has sent you an interest request on Merukayana Matrimony.</p><p>Login to your account to view their profile and respond.</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            },
            {
                slug: 'interest_accepted',
                name: 'Interest Accepted',
                subject: 'Your interest has been accepted!',
                body: '<h3>Hello {{recipientName}},</h3><p>{{senderName}} has accepted your interest request!</p><p>You can now view their contact details and start communicating.</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            },
            {
                slug: 'message_received',
                name: 'New Message Received',
                subject: 'You have a new message!',
                body: '<h3>Hello {{recipientName}},</h3><p>You have received a new message from {{senderName}}.</p><p>"{{messageSnippet}}"</p><p>Login to reply.</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            },
            {
                slug: 'account_created',
                name: 'Account Created',
                subject: 'Welcome to Merukayana Matrimony',
                body: '<h3>Welcome {{name}}!</h3><p>Your account has been successfully created. We are excited to help you find your perfect life partner.</p><p>Please complete your profile to get more visibility.</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            },
            {
                slug: 'profile_verified',
                name: 'Profile Verified',
                subject: 'Great news! Your profile is verified',
                body: '<h3>Hello {{name}},</h3><p>Your profile has been verified by our admin team and is now visible to other users.</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            },
            {
                slug: 'profile_rejected',
                name: 'Profile Verification Update',
                subject: 'Update on your profile verification',
                body: '<h3>Hello {{name}},</h3><p>Your profile verification was not successful at this time.</p><p><strong>Reason/Remarks:</strong> {{remarks}}</p><p>Please update your profile information and photos as per the guidelines and try again.</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            },
            {
                slug: 'payment_approved',
                name: 'Payment Approved',
                subject: 'Your Premium Subscription is Active!',
                body: '<h3>Hello {{name}},</h3><p>Great news! Your payment for the <strong>{{planName}}</strong> plan has been approved. Your premium features are now active.</p><p><strong>Subscription Expires on:</strong> {{expiryDate}}</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            },
            {
                slug: 'payment_rejected',
                name: 'Payment Rejected',
                subject: 'Update on your payment verification',
                body: '<h3>Hello {{name}},</h3><p>Your payment verification was not successful.</p><p><strong>Reason/Notes:</strong> {{reason}}</p><p>Please re-submit the payment proof with correct details.</p><br><p>Regards,<br>Merukayana Matrimony Team</p>'
            }
        ];

        for (const t of templates) {
            await connection.execute(
                'INSERT IGNORE INTO email_templates (slug, name, subject, body) VALUES (?, ?, ?, ?)',
                [t.slug, t.name, t.subject, t.body]
            );
        }
        console.log('Initial email templates seeded.');

    } catch (error) {
        console.error('Initialization Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

initEmailDb();
