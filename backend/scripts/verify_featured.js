const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@merukulam.com';
const ADMIN_PASSWORD = 'admin123'; // Assuming default

async function verifyFeaturedFlow() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/admin-login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.data.token;
        console.log('Login successful. Token obtained.');

        console.log('2. Fetching all users to find a profile to feature...');
        const usersRes = await axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Find a user with a profile
        const users = usersRes.data.data.users;
        const targetUser = users.find(u => u.profile_id);
        if (!targetUser) {
            console.log('No profiles found in user list. Available Users:', users.length);
            return;
        }
        const profileId = targetUser.profile_id;
        console.log(`Target Profile ID: ${profileId}`);

        console.log('3. Setting profile as Featured...');
        await axios.put(`${API_URL}/admin/users/${targetUser.id}/profile`, {
            isFeatured: true
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile updated to Featured.');

        console.log('4. Verifying public featured profiles endpoint...');
        const publicRes = await axios.get(`${API_URL}/profiles?isFeatured=true`);

        const featuredProfiles = publicRes.data.data.profiles;
        const isProfileFeatured = featuredProfiles.some(p => p.id === profileId);

        if (isProfileFeatured) {
            console.log('SUCCESS: Profile found in featured list!');
        } else {
            console.error('FAILURE: Profile NOT found in featured list.');
            console.log('Featured IDs:', featuredProfiles.map(p => p.id));
        }

        console.log('5. Cleaning up (Un-featuring)...');
        await axios.put(`${API_URL}/admin/users/${targetUser.id}/profile`, {
            isFeatured: false
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile un-featured.');

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyFeaturedFlow();
