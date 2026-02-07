const { query } = require('../config/database');

// Get all profiles with pagination
const getAllProfiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const gender = req.query.gender;
        const isFeatured = req.query.isFeatured;

        let sql = `
      SELECT DISTINCT p.*,
            u.email, u.mobile,
            l.city, l.state,
            pd.occupation, pd.occupation_category, pd.annual_income,
            ed.education_level
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN location_details l ON p.id = l.profile_id
      LEFT JOIN professional_details pd ON p.id = pd.profile_id
      LEFT JOIN education_details ed ON p.id = ed.profile_id
      WHERE p.profile_status = 'verified' AND u.status = 'active'
    `;

        const params = [];

        if (gender) {
            sql += ' AND p.gender = ?';
            params.push(gender);
        }

        if (isFeatured === 'true') {
            sql += ' AND p.is_featured = TRUE';
        }

        sql += ' ORDER BY p.is_featured DESC, p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const profiles = await query(sql, params);

        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM profiles p INNER JOIN users u ON p.user_id = u.id WHERE p.profile_status = ? AND u.status = ?';
        const countParams = ['verified', 'active'];

        if (gender) {
            countSql += ' AND p.gender = ?';
            countParams.push(gender);
        }

        if (isFeatured === 'true') {
            countSql += ' AND p.is_featured = TRUE';
        }

        const [{ total }] = await query(countSql, countParams);

        res.json({
            success: true,
            data: {
                profiles,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get profiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profiles'
        });
    }
};

// Get single profile by ID
const getProfileById = async (req, res) => {
    try {
        const profileId = req.params.id;

        const profiles = await query(
            `SELECT p.*,
            u.email, u.mobile, u.subscription_status, u.subscription_plan_id, u.subscription_expires_at,
            sp.name as subscription_plan_name,
            l.permanent_address, l.city, l.state, l.country, l.current_location, l.pincode,
            pd.occupation, pd.occupation_category, pd.company_name, pd.annual_income, pd.work_location,
            ed.education_level, ed.field_of_study, ed.institution, ed.year_of_completion,
            fd.father_name, fd.father_occupation, fd.mother_name, fd.mother_occupation,
            fd.brothers, fd.sisters, fd.family_type, fd.family_status, fd.family_values,
            ad.raasi, ad.star, ad.birth_time, ad.birth_place, ad.gothram, ad.dosham,
            p.matrimony_id as matrimonyId
       FROM profiles p
       INNER JOIN users u ON p.user_id = u.id
       LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
       LEFT JOIN location_details l ON p.id = l.profile_id
       LEFT JOIN professional_details pd ON p.id = pd.profile_id
       LEFT JOIN education_details ed ON p.id = ed.profile_id
       LEFT JOIN family_details fd ON p.id = fd.profile_id
       LEFT JOIN astrology_details ad ON p.id = ad.profile_id
       WHERE p.id = ? `,
            [profileId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Get additional photos
        const photos = await query(
            'SELECT id, photo_url, is_primary FROM profile_photos WHERE profile_id = ? ORDER BY is_primary DESC',
            [profileId]
        );

        // Track profile view if user is authenticated
        if (req.user && req.user.id) {
            await query(
                'INSERT INTO profile_views (viewer_id, profile_id) VALUES (?, ?)',
                [req.user.id, profileId]
            );
        }

        const profile = profiles[0];
        profile.photos = photos;

        // Check interest and subscription status if user is authenticated
        if (req.user && req.user.id) {
            // Get sender's profile id and subscription status
            const [viewer] = await query(
                'SELECT id, subscription_status FROM users WHERE id = ?',
                [req.user.id]
            );

            const [viewerProfile] = await query(
                'SELECT id FROM profiles WHERE user_id = ?',
                [req.user.id]
            );

            // Redact contact info if not premium/admin/owner
            const canViewContact = req.user.role === 'admin' ||
                req.user.id === profile.user_id ||
                (viewer && viewer.subscription_status === 'active');

            if (!canViewContact) {
                profile.email = null;
                profile.mobile = null;
            }

            if (viewerProfile) {
                const [interest] = await query(
                    'SELECT status, sender_id FROM interest_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
                    [viewerProfile.id, profileId, profileId, viewerProfile.id]
                );

                if (interest) {
                    if (interest.status === 'accepted') {
                        profile.interestStatus = 'accepted';
                    } else if (interest.sender_id === viewerProfile.id) {
                        profile.interestStatus = interest.status; // pending or rejected
                    } else {
                        profile.interestStatus = 'received'; // pending request from them
                    }
                } else {
                    profile.interestStatus = null;
                }
            }
        } else {
            // Guest user - hide contact info
            profile.email = null;
            profile.mobile = null;
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const profileId = req.params.id;
        const userId = req.user.id;

        // Check if user owns this profile
        const profiles = await query(
            'SELECT user_id FROM profiles WHERE id = ?',
            [profileId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        if (profiles[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this profile'
            });
        }

        const {
            firstName, lastName, dateOfBirth, maritalStatus, height, weight,
            complexion, bloodGroup, bio, isFeatured,
            // Location
            permanentAddress, city, state, country, currentLocation, pincode,
            // Professional
            occupation, occupationCategory, companyName, annualIncome, workLocation,
            // Education
            educationLevel, fieldOfStudy, institution, yearOfCompletion,
            // Family
            fatherName, fatherOccupation, motherName, motherOccupation,
            brothers, sisters, familyType, familyStatus, familyValues,
            // Astrology
            raasi, star, birthTime, birthPlace, gothram, dosham
        } = req.body;

        // Calculate age if dateOfBirth is provided
        let calculatedAge = req.body.age; // Default to provided age
        if (dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
        }

        // Update main profile
        if (firstName || lastName || calculatedAge || dateOfBirth || maritalStatus || height || weight || complexion || bloodGroup || bio || isFeatured !== undefined) {
            const updates = [];
            const values = [];

            if (firstName) { updates.push('first_name = ?'); values.push(firstName); }
            if (lastName) { updates.push('last_name = ?'); values.push(lastName); }
            if (calculatedAge) { updates.push('age = ?'); values.push(calculatedAge); }
            if (dateOfBirth) { updates.push('date_of_birth = ?'); values.push(dateOfBirth); }
            if (maritalStatus) { updates.push('marital_status = ?'); values.push(maritalStatus); }
            if (height) { updates.push('height = ?'); values.push(height); }
            if (weight) { updates.push('weight = ?'); values.push(weight); }
            if (complexion) { updates.push('complexion = ?'); values.push(complexion); }
            if (bloodGroup) { updates.push('blood_group = ?'); values.push(bloodGroup); }
            if (bio) { updates.push('bio = ?'); values.push(bio); }

            // Only admin can update isFeatured
            if (isFeatured !== undefined && req.user.role === 'admin') {
                updates.push('is_featured = ?');
                values.push(isFeatured);
            }

            if (updates.length > 0) {
                values.push(profileId);
                await query(
                    `UPDATE profiles SET ${updates.join(', ')} WHERE id = ? `,
                    values
                );
            }
        }

        // Update location details (no changes needed)
        // ... (lines 201-215 kept same logic flow, implicitly handled by not changing them) ...
        if (permanentAddress || city || state || country || currentLocation || pincode) {
            await query(
                `INSERT INTO location_details(profile_id, permanent_address, city, state, country, current_location, pincode)
        VALUES(?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
        permanent_address = VALUES(permanent_address),
            city = VALUES(city),
            state = VALUES(state),
            country = VALUES(country),
            current_location = VALUES(current_location),
            pincode = VALUES(pincode)`,
                [profileId, permanentAddress || null, city || null, state || null, country || 'India', currentLocation || null, pincode || null]
            );
        }

        // Update professional details
        if (occupation || occupationCategory || companyName || annualIncome || workLocation) {
            await query(
                `INSERT INTO professional_details(profile_id, occupation, occupation_category, company_name, annual_income, work_location)
        VALUES(?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
        occupation = VALUES(occupation),
            occupation_category = VALUES(occupation_category),
            company_name = VALUES(company_name),
            annual_income = VALUES(annual_income),
            work_location = VALUES(work_location)`,
                [profileId, occupation || null, occupationCategory || null, companyName || null, annualIncome || null, workLocation || null]
            );
        }

        // Update education details
        if (educationLevel || fieldOfStudy || institution || yearOfCompletion) {
            await query(
                `INSERT INTO education_details(profile_id, education_level, field_of_study, institution, year_of_completion)
        VALUES(?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
        education_level = VALUES(education_level),
            field_of_study = VALUES(field_of_study),
            institution = VALUES(institution),
            year_of_completion = VALUES(year_of_completion)`,
                [profileId, educationLevel || null, fieldOfStudy || null, institution || null, yearOfCompletion || null]
            );
        }

        // Update family details
        if (fatherName || fatherOccupation || motherName || motherOccupation || brothers !== undefined || sisters !== undefined || familyType || familyStatus || familyValues) {
            await query(
                `INSERT INTO family_details(profile_id, father_name, father_occupation, mother_name, mother_occupation, brothers, sisters, family_type, family_status, family_values)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                [profileId, fatherName || null, fatherOccupation || null, motherName || null, motherOccupation || null, brothers !== undefined ? brothers : null, sisters !== undefined ? sisters : null, familyType || null, familyStatus || null, familyValues || null]
            );
        }

        // Update astrology details
        if (raasi || star || birthTime || birthPlace || gothram || dosham) {
            await query(
                `INSERT INTO astrology_details(profile_id, raasi, star, birth_time, birth_place, gothram, dosham)
        VALUES(?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
        raasi = VALUES(raasi),
            star = VALUES(star),
            birth_time = VALUES(birth_time),
            birth_place = VALUES(birth_place),
            gothram = VALUES(gothram),
            dosham = VALUES(dosham)`,
                [profileId, raasi || null, star || null, birthTime || null, birthPlace || null, gothram || null, dosham || null]
            );
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        console.error('SQL Error Message:', error.sqlMessage);

        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.sqlMessage || error.message
        });
    }
};

// Search profiles with filters
const searchProfiles = async (req, res) => {
    try {
        const {
            gender,
            ageFrom,
            ageTo,
            heightFrom,
            heightTo,
            maritalStatus,
            education,
            occupation,
            incomeFrom,
            incomeTo,
            city,
            state,
            raasi,
            star
        } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;

        let sql = `
      SELECT DISTINCT p.*,
            u.email, u.mobile,
            l.city, l.state,
            pd.occupation, pd.occupation_category, pd.annual_income,
            ed.education_level
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN location_details l ON p.id = l.profile_id
      LEFT JOIN professional_details pd ON p.id = pd.profile_id
      LEFT JOIN education_details ed ON p.id = ed.profile_id
      LEFT JOIN astrology_details ad ON p.id = ad.profile_id
      WHERE p.profile_status = 'verified' AND u.status = 'active'
            `;

        const params = [];

        if (gender) {
            sql += ' AND p.gender = ?';
            params.push(gender);
        }

        if (ageFrom) {
            sql += ' AND p.age >= ?';
            params.push(parseInt(ageFrom));
        }

        if (ageTo) {
            sql += ' AND p.age <= ?';
            params.push(parseInt(ageTo));
        }

        if (maritalStatus) {
            sql += ' AND p.marital_status = ?';
            params.push(maritalStatus);
        }

        if (education) {
            sql += ' AND ed.education_level = ?';
            params.push(education);
        }

        if (occupation) {
            sql += ' AND pd.occupation_category = ?';
            params.push(occupation);
        }

        if (city) {
            sql += ' AND l.city LIKE ?';
            params.push(`% ${city}% `);
        }

        if (state) {
            sql += ' AND l.state LIKE ?';
            params.push(`% ${state}% `);
        }

        if (raasi) {
            sql += ' AND ad.raasi = ?';
            params.push(raasi);
        }

        if (star) {
            sql += ' AND ad.star = ?';
            params.push(star);
        }

        sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const profiles = await query(sql, params);

        // Get total count for searching with same filters
        let countSql = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM profiles p
            INNER JOIN users u ON p.user_id = u.id
            LEFT JOIN location_details l ON p.id = l.profile_id
            LEFT JOIN professional_details pd ON p.id = pd.profile_id
            LEFT JOIN education_details ed ON p.id = ed.profile_id
            LEFT JOIN astrology_details ad ON p.id = ad.profile_id
            WHERE p.profile_status = 'verified' AND u.status = 'active'
            `;

        const countParams = [];
        if (gender) { countSql += ' AND p.gender = ?'; countParams.push(gender); }
        if (ageFrom) { countSql += ' AND p.age >= ?'; countParams.push(parseInt(ageFrom)); }
        if (ageTo) { countSql += ' AND p.age <= ?'; countParams.push(parseInt(ageTo)); }
        if (maritalStatus) { countSql += ' AND p.marital_status = ?'; countParams.push(maritalStatus); }
        if (education) { countSql += ' AND ed.education_level = ?'; countParams.push(education); }
        if (occupation) { countSql += ' AND pd.occupation_category = ?'; countParams.push(occupation); }
        if (city) { countSql += ' AND l.city LIKE ?'; countParams.push(`% ${city}% `); }
        if (state) { countSql += ' AND l.state LIKE ?'; countParams.push(`% ${state}% `); }
        if (raasi) { countSql += ' AND ad.raasi = ?'; countParams.push(raasi); }
        if (star) { countSql += ' AND ad.star = ?'; countParams.push(star); }

        const countResult = await query(countSql, countParams);
        const total = countResult[0]?.total || 0;

        res.json({
            success: true,
            data: {
                profiles,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Search profiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search profiles'
        });
    }
};

// Upload profile images
const uploadProfileImages = async (req, res) => {
    try {
        const profileId = req.params.id;
        const userId = req.user.id;

        // Check if user owns this profile or is admin
        const profiles = await query(
            'SELECT user_id FROM profiles WHERE id = ?',
            [profileId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        if (profiles[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to upload images for this profile'
            });
        }

        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        // Insert uploaded images into database
        const uploadedImages = [];
        for (const file of req.files) {
            const photoUrl = `/ uploads / profiles / ${file.filename} `;

            // Check if this is the first photo for this profile
            const existingPhotos = await query(
                'SELECT COUNT(*) as count FROM profile_photos WHERE profile_id = ?',
                [profileId]
            );

            const isFirstPhoto = existingPhotos[0].count === 0;

            // Insert into profile_photos table
            const result = await query(
                'INSERT INTO profile_photos (profile_id, photo_url, is_primary) VALUES (?, ?, ?)',
                [profileId, photoUrl, isFirstPhoto]
            );

            // If it's the first photo, also update the main profiles table
            if (isFirstPhoto) {
                await query(
                    'UPDATE profiles SET profile_photo = ? WHERE id = ?',
                    [photoUrl, profileId]
                );
            }

            uploadedImages.push({
                id: result.insertId,
                url: photoUrl,
                isPrimary: isFirstPhoto
            });
        }

        res.json({
            success: true,
            message: 'Images uploaded successfully',
            data: uploadedImages
        });
    } catch (error) {
        console.error('Upload images error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images'
        });
    }
};

// Get profile photos
const getProfilePhotos = async (req, res) => {
    try {
        const profileId = req.params.id;

        const photos = await query(
            'SELECT id, photo_url, photo_url as url, is_primary FROM profile_photos WHERE profile_id = ? ORDER BY is_primary DESC, id DESC',
            [profileId]
        );

        // Map is_primary to isPrimary to match frontend expectation
        const photosWithCamelCase = photos.map(photo => ({
            ...photo,
            isPrimary: photo.is_primary
        }));

        res.json({
            success: true,
            data: photosWithCamelCase
        });
    } catch (error) {
        console.error('Get profile photos error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile photos'
        });
    }
};

// Delete profile photo
const deleteProfilePhoto = async (req, res) => {
    try {
        const profileId = req.params.id;
        const photoId = req.params.photoId;
        const userId = req.user.id;

        // Check if user owns this profile or is admin
        const profiles = await query(
            'SELECT user_id FROM profiles WHERE id = ?',
            [profileId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        if (profiles[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete photos for this profile'
            });
        }

        // Get photo details before deleting
        const photos = await query(
            'SELECT photo_url, is_primary FROM profile_photos WHERE id = ? AND profile_id = ?',
            [photoId, profileId]
        );

        if (photos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

        const wasPrimary = photos[0].is_primary;

        // Delete from database
        await query(
            'DELETE FROM profile_photos WHERE id = ?',
            [photoId]
        );

        // If deleted photo was primary, set another photo as primary
        if (wasPrimary) {
            const remainingPhotos = await query(
                'SELECT id FROM profile_photos WHERE profile_id = ? ORDER BY id ASC LIMIT 1',
                [profileId]
            );

            if (remainingPhotos.length > 0) {
                await query(
                    'UPDATE profile_photos SET is_primary = 1 WHERE id = ?',
                    [remainingPhotos[0].id]
                );

                // Update main profile table
                const newPrimaryPhoto = await query(
                    'SELECT photo_url FROM profile_photos WHERE id = ?',
                    [remainingPhotos[0].id]
                );

                await query(
                    'UPDATE profiles SET profile_photo = ? WHERE id = ?',
                    [newPrimaryPhoto[0].photo_url, profileId]
                );
            } else {
                // No photos left, clear profile_photo
                await query(
                    'UPDATE profiles SET profile_photo = NULL WHERE id = ?',
                    [profileId]
                );
            }
        }

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete photo'
        });
    }
};

module.exports = {
    getAllProfiles,
    getProfileById,
    updateProfile,
    searchProfiles,
    uploadProfileImages,
    getProfilePhotos,
    deleteProfilePhoto
};
