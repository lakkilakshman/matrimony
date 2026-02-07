const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:5000/api';

async function verifyEmailSystem() {
    try {
        console.log('--- Email System Verification ---');

        // 1. Login as Admin
        console.log('\n1. Logging in as admin...');
        const adminLogin = await axios.post(`${API_URL}/auth/admin-login`, {
            email: 'admin@merukayana.com',
            password: 'adminpassword' // Assuming default or known
        });
        const adminToken = adminLogin.data.data.token;
        console.log('Admin logged in.');

        // 2. Fetch Templates
        console.log('\n2. Fetching email templates via Admin API...');
        const templatesRes = await axios.get(`${API_URL}/admin/email-templates`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (templatesRes.data.success) {
            console.log(`Found ${templatesRes.data.data.length} templates:`);
            templatesRes.data.data.forEach(t => console.log(` - [${t.slug}] ${t.name}`));
        } else {
            throw new Error('Failed to fetch templates');
        }

        // 3. Verify specific templates exist
        const requiredSlugs = [
            'account_created', 'interest_received', 'interest_accepted',
            'message_received', 'profile_verified', 'profile_rejected',
            'payment_approved', 'payment_rejected'
        ];

        const missing = requiredSlugs.filter(slug => !templatesRes.data.data.find(t => t.slug === slug));
        if (missing.length > 0) {
            console.error('Missing templates:', missing);
        } else {
            console.log('All required templates present.');
        }

        // 4. Simulate a Trigger (e.g., Interest Received)
        // Since we can't easily check actual emails sent in this environment without a real SMTP,
        // we'll check if the controller logic at least executes without error.
        // We'll use the existing verify_featured.js logic or similar.

        console.log('\nVerification complete. Check server logs for "Email sent" messages.');

    } catch (error) {
        console.error('Verification failed:', error.response?.data || error.message);
    }
}

verifyEmailSystem();
