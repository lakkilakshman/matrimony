const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { calculateAge } = require('../utils/helpers');
const { sendEmailTemplate } = require('../utils/emailService');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Total users
        const [{ total_users }] = await query(
            'SELECT COUNT(*) as total_users FROM users WHERE role = ?',
            ['user']
        );

        // Total profiles
        const [{ total_profiles }] = await query(
            'SELECT COUNT(*) as total_profiles FROM profiles'
        );

        // Verified profiles
        const [{ verified_profiles }] = await query(
            'SELECT COUNT(*) as verified_profiles FROM profiles WHERE profile_status = ?',
            ['verified']
        );

        // Pending verifications
        const [{ pending_verifications }] = await query(
            'SELECT COUNT(*) as pending_verifications FROM profiles WHERE profile_status = ?',
            ['pending']
        );

        // Active users (logged in last 30 days)
        const [{ active_users }] = await query(
            'SELECT COUNT(*) as active_users FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );

        // Male/Female count
        const [{ male_count }] = await query(
            'SELECT COUNT(*) as male_count FROM profiles WHERE gender = ?',
            ['male']
        );

        const [{ female_count }] = await query(
            'SELECT COUNT(*) as female_count FROM profiles WHERE gender = ?',
            ['female']
        );

        // Recent registrations (last 7 days count)
        const [{ recent_registrations }] = await query(
            'SELECT COUNT(*) as recent_registrations FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );

        // Recent user list (last 5)
        const recent_users_list = await query(
            `SELECT u.id, u.email, u.status, u.created_at, p.first_name, p.last_name 
             FROM users u 
             LEFT JOIN profiles p ON u.id = p.user_id 
             WHERE u.role = 'user'
             ORDER BY u.created_at DESC 
             LIMIT 5`,
            []
        );

        res.json({
            success: true,
            data: {
                total_users,
                total_profiles,
                verified_profiles,
                pending_verifications,
                active_users,
                male_count,
                female_count,
                recent_registrations,
                recent_users: recent_users_list.map(user => ({
                    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
                    status: user.status,
                    created_at: user.created_at,
                    action: user.status === 'active' ? 'Registered & Active' : user.status === 'pending' ? 'Pending Verification' : 'Blocked'
                }))
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const users = await query(
            `SELECT u.id, u.email, u.mobile, u.role, u.status, u.created_at, u.last_login,
              MAX(p.id) as profile_id, MAX(p.matrimony_id) as matrimony_id,
              MAX(p.first_name) as first_name, MAX(p.last_name) as last_name, 
              MAX(p.gender) as gender, MAX(p.date_of_birth) as date_of_birth, MAX(p.age) as age, 
              MAX(p.marital_status) as marital_status, MAX(p.height) as height, MAX(p.weight) as weight, 
              MAX(p.complexion) as complexion, MAX(p.religion) as religion, MAX(p.caste) as caste, 
              MAX(p.bio) as bio, MAX(p.profile_photo) as profile_photo, MAX(p.profile_status) as profile_status,
              MAX(p.is_featured) as is_featured,
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
       WHERE u.role = 'user'
       GROUP BY u.id, u.email, u.mobile, u.role, u.status, u.created_at, u.last_login
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        console.log(`[getAllUsers] Executed query. Found ${users.length} users. Limit: ${limit}, Offset: ${offset}`);

        const [{ total }] = await query(
            'SELECT COUNT(*) as total FROM users WHERE role = ?',
            ['user']
        );

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// Update user status
const updateUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        await query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId]
        );

        // Log admin action
        await query(
            'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, 'update_user_status', 'user', userId, `Changed status to ${status}`]
        );

        res.json({
            success: true,
            message: 'User status updated successfully'
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
};

// Get pending profile verifications
const getPendingVerifications = async (req, res) => {
    try {
        const profiles = await query(
            `SELECT p.*, u.email, u.mobile, l.city, l.state, pd.occupation
       FROM profiles p
       INNER JOIN users u ON p.user_id = u.id
       LEFT JOIN location_details l ON p.id = l.profile_id
       LEFT JOIN professional_details pd ON p.id = pd.profile_id
       WHERE p.profile_status = 'pending'
       ORDER BY p.created_at ASC`
        );

        res.json({
            success: true,
            data: profiles
        });
    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending verifications'
        });
    }
};

// Verify profile
const verifyProfile = async (req, res) => {
    try {
        const profileId = req.params.id;
        const { status, remarks } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be verified or rejected'
            });
        }

        await query(
            'UPDATE profiles SET profile_status = ? WHERE id = ?',
            [status, profileId]
        );

        // Get profile user details for notification
        const [profileData] = await query(
            `SELECT p.user_id, p.first_name, p.last_name, u.email 
             FROM profiles p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [profileId]
        );

        if (profileData) {
            // Create notification
            await query(
                'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
                [
                    profileData.user_id,
                    'profile_verified',
                    status === 'verified' ? 'Profile Verified' : 'Profile Rejected',
                    status === 'verified'
                        ? 'Your profile has been verified and is now visible to other users.'
                        : `Your profile verification was rejected. ${remarks || 'Please update your profile and try again.'}`
                ]
            );

            // Send Email
            const templateSlug = status === 'verified' ? 'profile_verified' : 'profile_rejected';
            sendEmailTemplate(profileData.email, templateSlug, {
                name: `${profileData.first_name} ${profileData.last_name}`,
                remarks: remarks || 'Please update your profile information and photos as per the guidelines and try again.'
            });
        }

        // Log admin action
        await query(
            'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, 'verify_profile', 'profile', profileId, `Status: ${status}. ${remarks || ''}`]
        );

        res.json({
            success: true,
            message: `Profile ${status} successfully`
        });
    } catch (error) {
        console.error('Verify profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify profile'
        });
    }
};

// Get admin activity logs
const getAdminLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const logs = await query(
            `SELECT al.*, u.email as admin_email
       FROM admin_logs al
       INNER JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Get admin logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin logs'
        });
    }
};

// Update a user's profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the profile for this user
        const profiles = await query('SELECT id FROM profiles WHERE user_id = ?', [userId]);

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const profileId = profiles[0].id;
        const data = req.body;

        console.log(`Admin updating profile ${profileId} for user ${userId}:`, data);

        // 1. Update Users Table (email, mobile, status)
        const userUpdates = [];
        const userValues = [];
        const userFields = {
            email: 'email',
            mobile: 'mobile',
            status: 'status'
        };

        for (const [key, col] of Object.entries(userFields)) {
            const val = data[key] !== undefined ? data[key] : data[col];
            if (val !== undefined) {
                userUpdates.push(`${col} = ?`);
                userValues.push(val);
            }
        }

        if (userUpdates.length > 0) {
            userValues.push(userId);
            await query(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`, userValues);
        }

        // 2. Update Profiles Table
        const profileUpdates = [];
        const profileValues = [];

        // Base profile fields - handles both camelCase and snake_case
        const baseFields = {
            firstName: 'first_name',
            lastName: 'last_name',
            age: 'age',
            dateOfBirth: 'date_of_birth',
            gender: 'gender',
            maritalStatus: 'marital_status',
            height: 'height',
            weight: 'weight',
            complexion: 'complexion',
            bio: 'bio',
            profileStatus: 'profile_status',
            isFeatured: 'is_featured'
        };

        for (const [key, col] of Object.entries(baseFields)) {
            const val = data[key] !== undefined ? data[key] : data[col];
            if (val !== undefined) {
                profileUpdates.push(`${col} = ?`);
                profileValues.push(val);
            }
        }

        if (profileUpdates.length > 0) {
            profileValues.push(profileId);
            await query(`UPDATE profiles SET ${profileUpdates.join(', ')} WHERE id = ?`, profileValues);
        }

        // 3. Location Info
        if (data.permanentAddress || data.permanent_address || data.city || data.state || data.country || data.currentLocation || data.current_location || data.pincode) {
            await query(
                `INSERT INTO location_details (profile_id, permanent_address, city, state, country, current_location, pincode)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 permanent_address = VALUES(permanent_address),
                 city = VALUES(city),
                 state = VALUES(state),
                 country = VALUES(country),
                 current_location = VALUES(current_location),
                 pincode = VALUES(pincode)`,
                [
                    profileId,
                    data.permanentAddress || data.permanent_address || null,
                    data.city || null,
                    data.state || null,
                    data.country || 'India',
                    data.currentLocation || data.current_location || null,
                    data.pincode || null
                ]
            );
        }

        // 4. Professional Info
        if (data.occupation || data.occupationCategory || data.occupation_category || data.company || data.company_name || data.annualIncome || data.annual_income || data.workLocation || data.work_location) {
            await query(
                `INSERT INTO professional_details (profile_id, occupation, occupation_category, company_name, annual_income, work_location)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 occupation = VALUES(occupation),
                 occupation_category = VALUES(occupation_category),
                 company_name = VALUES(company_name),
                 annual_income = VALUES(annual_income),
                 work_location = VALUES(work_location)`,
                [
                    profileId,
                    data.occupation || null,
                    data.occupationCategory || data.occupation_category || null,
                    data.company || data.company_name || null,
                    data.annualIncome || data.annual_income || null,
                    data.workLocation || data.work_location || null
                ]
            );
        }

        // 5. Education Info
        if (data.education || data.education_level || data.fieldOfStudy || data.field_of_study || data.institution || data.yearOfCompletion || data.year_of_completion) {
            await query(
                `INSERT INTO education_details (profile_id, education_level, field_of_study, institution, year_of_completion)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 education_level = VALUES(education_level),
                 field_of_study = VALUES(field_of_study),
                 institution = VALUES(institution),
                 year_of_completion = VALUES(year_of_completion)`,
                [
                    profileId,
                    data.education || data.education_level || null,
                    data.fieldOfStudy || data.field_of_study || null,
                    data.institution || null,
                    data.yearOfCompletion || data.year_of_completion || null
                ]
            );
        }

        // 6. Family Info
        if (data.fatherName || data.father_name || data.fatherOccupation || data.father_occupation || data.motherName || data.mother_name || data.motherOccupation || data.mother_occupation || data.brothers !== undefined || data.sisters !== undefined || data.familyType || data.family_type || data.familyStatus || data.family_status || data.familyValues || data.family_values) {
            await query(
                `INSERT INTO family_details (profile_id, father_name, father_occupation, mother_name, mother_occupation, brothers, sisters, family_type, family_status, family_values)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 father_name = VALUES(father_name),
                 father_occupation = VALUES(father_occupation),
                 mother_name = VALUES(mother_name),
                 mother_occupation = VALUES(mother_occupation),
                 brothers = VALUES(brothers),
                 sisters = VALUES(sisters),
                 family_type = VALUES(family_type),
                 family_status = VALUES(family_status),
                 family_values = VALUES(family_values)`,
                [
                    profileId,
                    data.fatherName || data.father_name || null,
                    data.fatherOccupation || data.father_occupation || null,
                    data.motherName || data.mother_name || null,
                    data.motherOccupation || data.mother_occupation || null,
                    data.brothers !== undefined ? data.brothers : null,
                    data.sisters !== undefined ? data.sisters : null,
                    data.familyType || data.family_type || null,
                    data.familyStatus || data.family_status || null,
                    data.familyValues || data.family_values || null
                ]
            );
        }

        // 7. Astrology Info
        if (data.raasi || data.star || data.birthTime || data.birth_time || data.birthPlace || data.birth_place || data.gothram || data.dosham) {
            await query(
                `INSERT INTO astrology_details (profile_id, raasi, star, birth_time, birth_place, gothram, dosham)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 raasi = VALUES(raasi),
                 star = VALUES(star),
                 birth_time = VALUES(birth_time),
                 birth_place = VALUES(birth_place),
                 gothram = VALUES(gothram),
                 dosham = VALUES(dosham)`,
                [
                    profileId,
                    data.raasi || null,
                    data.star || null,
                    data.birthTime || data.birth_time || null,
                    data.birthPlace || data.birth_place || null,
                    data.gothram || null,
                    data.dosham || null
                ]
            );
        }

        // 8. Update Profile Photos - Sync Primary Image
        if (data.images && Array.isArray(data.images)) {
            await transaction(async (connection) => {
                // First, reset all photos to not primary
                await connection.execute(
                    'UPDATE profile_photos SET is_primary = 0 WHERE profile_id = ?',
                    [profileId]
                );

                const primaryImage = data.images.find(img => img.isPrimary);
                if (primaryImage) {
                    // Update specific photo to primary
                    await connection.execute(
                        'UPDATE profile_photos SET is_primary = 1 WHERE id = ? AND profile_id = ?',
                        [primaryImage.id, profileId]
                    );

                    // Sync to main profiles table
                    await connection.execute(
                        'UPDATE profiles SET profile_photo = ? WHERE id = ?',
                        [primaryImage.url, profileId]
                    );
                } else if (data.images.length > 0) {
                    // If no primary specified but images exist, use first as primary
                    const firstImage = data.images[0];
                    await connection.execute(
                        'UPDATE profile_photos SET is_primary = 1 WHERE id = ? AND profile_id = ?',
                        [firstImage.id, profileId]
                    );
                    await connection.execute(
                        'UPDATE profiles SET profile_photo = ? WHERE id = ?',
                        [firstImage.url, profileId]
                    );
                } else {
                    // Clear profile photo if all removed
                    await connection.execute(
                        'UPDATE profiles SET profile_photo = NULL WHERE id = ?',
                        [profileId]
                    );
                }
            });
        }


        // Log admin action
        await query(
            'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, 'update_user_profile', 'profile', profileId, `Updated user profile/account and status for user ${userId}`]
        );

        res.json({
            success: true,
            message: 'User profile updated successfully'
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user profile'
        });
    }
};

// Create new user and profile by admin
const createUserProfile = async (req, res) => {
    try {
        const {
            // Account Details
            email, mobile, password,
            // Personal Details
            firstName, lastName, gender, dateOfBirth, maritalStatus,
            height, weight, complexion, religion, caste, bio,
            // Location
            permanentAddress, city, state, country, currentLocation, pincode,
            // Education
            education, fieldOfStudy, institution, yearOfCompletion,
            // Professional
            occupation, occupationCategory, company, annualIncome, workLocation,
            // Family
            fatherName, fatherOccupation, motherName, motherOccupation, brothers, sisters,
            // Astrology
            raasi, star, birthTime, birthPlace
        } = req.body;

        // Validation
        if (!email || !mobile || !password || !firstName || !lastName || !gender || !dateOfBirth) {
            return res.status(400).json({
                success: false,
                message: 'Mandatory fields are missing (Email, Mobile, Password, Names, Gender, DOB)'
            });
        }

        // Check availability
        const existing = await query('SELECT id FROM users WHERE email = ? OR mobile = ?', [email, mobile]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or mobile already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const age = calculateAge(dateOfBirth);

        const userId = await transaction(async (connection) => {
            // 1. Create User
            const [userResult] = await connection.execute(
                'INSERT INTO users (email, mobile, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
                [email, mobile, passwordHash, 'user', 'active']
            );
            const uId = userResult.insertId;

            // 2. Create Base Profile
            const [profileResult] = await connection.execute(
                `INSERT INTO profiles (
                    user_id, first_name, last_name, gender, date_of_birth, age, marital_status,
                    height, weight, complexion, religion, caste, bio, profile_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uId, firstName, lastName, gender, dateOfBirth, age, maritalStatus || 'never_married',
                    height, weight, complexion, religion || 'Hindu', caste || 'Merukayana', bio, 'verified'
                ]
            );
            const pId = profileResult.insertId;

            // 3. Insert Location Details
            await connection.execute(
                `INSERT INTO location_details (profile_id, permanent_address, city, state, country, current_location, pincode)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [pId, permanentAddress, city, state, country || 'India', currentLocation, pincode]
            );

            // 4. Insert Education Details
            await connection.execute(
                `INSERT INTO education_details (profile_id, education_level, field_of_study, institution, year_of_completion)
                 VALUES (?, ?, ?, ?, ?)`,
                [pId, education, fieldOfStudy, institution, yearOfCompletion || null]
            );

            // 5. Insert Professional Details
            await connection.execute(
                `INSERT INTO professional_details (profile_id, occupation, occupation_category, company_name, annual_income, work_location)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [pId, occupation, occupationCategory, company, annualIncome, workLocation]
            );

            // 6. Insert Family Details
            await connection.execute(
                `INSERT INTO family_details (profile_id, father_name, father_occupation, mother_name, mother_occupation, brothers, sisters)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [pId, fatherName || null, fatherOccupation || null, motherName || null, motherOccupation || null, brothers || 0, sisters || 0]
            );

            // 7. Insert Astrology Details
            await connection.execute(
                `INSERT INTO astrology_details (profile_id, raasi, star, birth_time, birth_place)
                 VALUES (?, ?, ?, ?, ?)`,
                [pId, raasi, star, birthTime || null, birthPlace]
            );

            // 8. Generate Matrimony ID
            const [settings] = await connection.execute(
                'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?)',
                ['matrimony_id_prefix', 'matrimony_id_start_number']
            );

            let prefix = 'MKM';
            let startNum = 1;

            settings.forEach(s => {
                if (s.setting_key === 'matrimony_id_prefix') prefix = s.setting_value;
                if (s.setting_key === 'matrimony_id_start_number') startNum = parseInt(s.setting_value);
            });

            const idNumber = startNum + pId - 1;
            const matrimonyId = `${prefix}${String(idNumber).padStart(6, '0')}`;

            await connection.execute(
                'UPDATE profiles SET matrimony_id = ? WHERE id = ?',
                [matrimonyId, pId]
            );

            return uId;
        });

        // Log Admin Action
        await query(
            'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, 'create_user_profile', 'user', userId, `Created full user profile for ${email}`]
        );

        res.status(201).json({
            success: true,
            message: 'User profile created successfully by administrator',
            data: { userId }
        });

    } catch (error) {
        console.error('Admin create profile error:', error);
        require('fs').writeFileSync('last_error.txt', error.toString());
        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    getPendingVerifications,
    verifyProfile,
    getAdminLogs,
    updateUserProfile,
    createUserProfile
};
