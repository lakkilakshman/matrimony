const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/database');
const { calculateAge } = require('../utils/helpers');
const { sendEmailTemplate } = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Register new user
const register = async (req, res) => {
    try {
        const { email, mobile, password, firstName, lastName, gender, dateOfBirth } = req.body;

        // Validate required fields
        if (!email || !mobile || !password || !firstName || !lastName || !gender || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUsers = await query(
            'SELECT id FROM users WHERE email = ? OR mobile = ?',
            [email, mobile]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or mobile already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Calculate age
        const age = calculateAge(dateOfBirth);

        // Create user and profile in transaction
        const result = await transaction(async (connection) => {
            // Insert user
            const [userResult] = await connection.execute(
                'INSERT INTO users (email, mobile, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
                [email, mobile, passwordHash, 'user', 'active']
            );

            const userId = userResult.insertId;

            // Insert basic profile with calculated age
            const [profileResult] = await connection.execute(
                `INSERT INTO profiles (user_id, first_name, last_name, gender, date_of_birth, age, marital_status, profile_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, firstName, lastName, gender, dateOfBirth, age, 'never_married', 'pending']
            );

            const profileId = profileResult.insertId;

            // Generate and update matrimony ID based on system settings
            const [prefixRow] = await connection.execute(
                'SELECT setting_value FROM system_settings WHERE setting_key = ?',
                ['matrimony_id_prefix']
            );
            const [startNumRow] = await connection.execute(
                'SELECT setting_value FROM system_settings WHERE setting_key = ?',
                ['matrimony_id_start_number']
            );

            const prefix = prefixRow[0]?.setting_value || 'MKM';
            const startNum = parseInt(startNumRow[0]?.setting_value) || 1;

            // Calculate ID: Prefix + (StartNumber + profileId - 1)
            const idNumber = startNum + profileId - 1;
            const matrimonyId = `${prefix}${String(idNumber).padStart(6, '0')}`;

            await connection.execute(
                'UPDATE profiles SET matrimony_id = ? WHERE id = ?',
                [matrimonyId, profileId]
            );

            return userId;
        });

        // Generate token
        const token = generateToken(result);

        // Send welcome email (don't await to avoid blocking response)
        sendEmailTemplate(email, 'account_created', {
            name: `${firstName} ${lastName}`
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: {
                    id: result,
                    email,
                    mobile,
                    role: 'user'
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const users = await query(
            `SELECT u.id, u.email, u.mobile, u.password_hash, u.role, u.status, 
             u.subscription_status, u.subscription_plan_id, u.subscription_expires_at,
             sp.name as subscription_plan_name
             FROM users u
             LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check account status
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or suspended'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Generate token
        const token = generateToken(user.id);

        // Get profile data
        const profiles = await query(
            `SELECT p.id as profile_id, p.id, p.user_id, MAX(p.matrimony_id) as matrimonyId,
            MAX(p.first_name) as first_name, MAX(p.last_name) as last_name, MAX(p.gender) as gender, 
            MAX(p.date_of_birth) as date_of_birth, MAX(p.age) as age,
            MAX(p.marital_status) as marital_status, MAX(p.height) as height, MAX(p.weight) as weight, 
            MAX(p.complexion) as complexion, MAX(p.religion) as religion, MAX(p.caste) as caste, 
            MAX(p.bio) as bio, MAX(p.profile_photo) as profile_photo, MAX(p.profile_status) as profile_status,
            MAX(l.permanent_address) as permanent_address, MAX(l.city) as city, MAX(l.state) as state, 
            MAX(l.country) as country, MAX(l.current_location) as current_location, MAX(l.pincode) as pincode,
            MAX(ed.education_level) as education_level, MAX(ed.field_of_study) as field_of_study, 
            MAX(ed.institution) as institution, MAX(ed.year_of_completion) as year_of_completion,
            MAX(pd.occupation) as occupation, MAX(pd.occupation_category) as occupation_category, 
            MAX(pd.company_name) as company_name, MAX(pd.annual_income) as annual_income, 
            MAX(pd.work_location) as work_location,
            MAX(fd.father_name) as father_name, MAX(fd.father_occupation) as father_occupation, 
            MAX(fd.mother_name) as mother_name, MAX(fd.mother_occupation) as mother_occupation, 
            MAX(fd.brothers) as brothers, MAX(fd.sisters) as sisters,
            MAX(ad.raasi) as raasi, MAX(ad.star) as star, MAX(ad.birth_time) as birth_time, 
            MAX(ad.birth_place) as birth_place
       FROM profiles p 
       LEFT JOIN location_details l ON p.id = l.profile_id 
       LEFT JOIN education_details ed ON p.id = ed.profile_id
       LEFT JOIN professional_details pd ON p.id = pd.profile_id
       LEFT JOIN family_details fd ON p.id = fd.profile_id
       LEFT JOIN astrology_details ad ON p.id = ad.profile_id
       WHERE p.user_id = ?
       GROUP BY p.id, p.user_id`,
            [user.id]
        );

        const profile = profiles[0] || {};

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role,
                    subscription_status: user.subscription_status,
                    subscription_plan_id: user.subscription_plan_id,
                    subscription_plan_name: user.subscription_plan_name,
                    subscription_expires_at: user.subscription_expires_at,
                    ...profile // Spread profile data to top level
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// Admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const users = await query(
            'SELECT id, email, mobile, password_hash, role, status FROM users WHERE email = ? AND role = ?',
            [email, 'admin']
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const user = users[0];

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await query(
            `SELECT u.id, u.email, u.mobile, u.role, u.status, 
              u.subscription_status, u.subscription_plan_id, u.subscription_expires_at,
              sp.name as subscription_plan_name,
              MAX(p.id) as profile_id, MAX(p.matrimony_id) as matrimonyId,
              MAX(p.first_name) as first_name, MAX(p.last_name) as last_name, 
              MAX(p.gender) as gender, MAX(p.date_of_birth) as date_of_birth, MAX(p.age) as age,
              MAX(p.marital_status) as marital_status, MAX(p.height) as height, MAX(p.weight) as weight, 
              MAX(p.complexion) as complexion, MAX(p.religion) as religion, MAX(p.caste) as caste, 
              MAX(p.bio) as bio, MAX(p.profile_photo) as profile_photo, MAX(p.profile_status) as profile_status,
              MAX(l.permanent_address) as permanent_address, MAX(l.city) as city, MAX(l.state) as state,
              MAX(l.country) as country, MAX(l.current_location) as current_location, MAX(l.pincode) as pincode,
              MAX(ed.education_level) as education_level, MAX(ed.field_of_study) as field_of_study,
              MAX(ed.institution) as institution, MAX(ed.year_of_completion) as year_of_completion,
              MAX(pd.occupation) as occupation, MAX(pd.occupation_category) as occupation_category,
              MAX(pd.company_name) as company_name, MAX(pd.annual_income) as annual_income,
              MAX(pd.work_location) as work_location,
              MAX(fd.father_name) as father_name, MAX(fd.father_occupation) as father_occupation,
              MAX(fd.mother_name) as mother_name, MAX(fd.mother_occupation) as mother_occupation,
              MAX(fd.brothers) as brothers, MAX(fd.sisters) as sisters,
              MAX(ad.raasi) as raasi, MAX(ad.star) as star, MAX(ad.birth_time) as birth_time,
              MAX(ad.birth_place) as birth_place
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN location_details l ON p.id = l.profile_id
       LEFT JOIN education_details ed ON p.id = ed.profile_id
       LEFT JOIN professional_details pd ON p.id = pd.profile_id
       LEFT JOIN family_details fd ON p.id = fd.profile_id
       LEFT JOIN astrology_details ad ON p.id = ad.profile_id
       LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
       WHERE u.id = ?
       GROUP BY u.id, u.email, u.mobile, u.role, u.status, u.subscription_status, u.subscription_plan_id, u.subscription_expires_at, sp.name`,
            [userId]
        );

        console.log('getCurrentUser - User data retrieved:', JSON.stringify(users[0], null, 2));

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
};

// Logout (client-side token removal, optional server-side blacklist)
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    register,
    login,
    adminLogin,
    getCurrentUser,
    logout
};
