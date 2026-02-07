const { query } = require('../config/database');
const { sendEmailTemplate } = require('../utils/emailService');

// Get sent interest requests
const getSentInterests = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's profile id
        const [userProfile] = await query(
            'SELECT id FROM profiles WHERE user_id = ?',
            [userId]
        );

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const interests = await query(
            `SELECT ir.*, 
              p.first_name, p.last_name, p.gender, p.age, p.profile_photo, p.user_id,
              l.city, l.state
       FROM interest_requests ir
       INNER JOIN profiles p ON ir.receiver_id = p.id
       LEFT JOIN location_details l ON p.id = l.profile_id
       WHERE ir.sender_id = ?
       ORDER BY ir.sent_at DESC`,
            [userProfile.id]
        );

        res.json({
            success: true,
            data: interests
        });
    } catch (error) {
        console.error('Get sent interests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sent interests'
        });
    }
};

// Get received interest requests
const getReceivedInterests = async (req, res) => {
    try {
        const userId = req.user.id;

        const [userProfile] = await query(
            'SELECT id FROM profiles WHERE user_id = ?',
            [userId]
        );

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const interests = await query(
            `SELECT ir.*, 
              p.first_name, p.last_name, p.gender, p.age, p.profile_photo, p.user_id,
              l.city, l.state,
              pd.occupation_category, pd.annual_income
       FROM interest_requests ir
       INNER JOIN profiles p ON ir.sender_id = p.id
       LEFT JOIN location_details l ON p.id = l.profile_id
       LEFT JOIN professional_details pd ON p.id = pd.profile_id
       WHERE ir.receiver_id = ?
       ORDER BY ir.sent_at DESC`,
            [userProfile.id]
        );

        res.json({
            success: true,
            data: interests
        });
    } catch (error) {
        console.error('Get received interests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch received interests'
        });
    }
};

// Send interest request
const sendInterest = async (req, res) => {
    try {
        const userId = req.user.id;
        const receiverProfileId = req.params.profileId;
        const { message } = req.body;

        // Get sender's profile id
        const [senderProfile] = await query(
            'SELECT id FROM profiles WHERE user_id = ?',
            [userId]
        );

        if (!senderProfile) {
            return res.status(404).json({
                success: false,
                message: 'Your profile not found'
            });
        }

        // Check if receiver profile exists
        const [receiverProfile] = await query(
            'SELECT id, user_id FROM profiles WHERE id = ?',
            [receiverProfileId]
        );

        if (!receiverProfile) {
            return res.status(404).json({
                success: false,
                message: 'Receiver profile not found'
            });
        }

        // Can't send interest to yourself
        if (senderProfile.id === receiverProfile.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send interest to yourself'
            });
        }

        // Send interest
        await query(
            'INSERT INTO interest_requests (sender_id, receiver_id, message, status) VALUES (?, ?, ?, ?)',
            [senderProfile.id, receiverProfileId, message || null, 'pending']
        );

        // Create notification for receiver
        await query(
            'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
            [
                receiverProfile.user_id,
                'interest_received',
                'New Interest Received',
                'Someone has shown interest in your profile',
                senderProfile.id
            ]
        );

        // Fetch receiver's email and details
        const [receiverUser] = await query('SELECT email FROM users WHERE id = ?', [receiverProfile.user_id]);
        const [senderDetails] = await query('SELECT first_name, last_name FROM profiles WHERE id = ?', [senderProfile.id]);
        const [receiverDetails] = await query('SELECT first_name, last_name FROM profiles WHERE id = ?', [receiverProfile.id]);

        if (receiverUser && senderDetails && receiverDetails) {
            sendEmailTemplate(receiverUser.email, 'interest_received', {
                recipientName: `${receiverDetails.first_name} ${receiverDetails.last_name}`,
                senderName: `${senderDetails.first_name} ${senderDetails.last_name}`
            });
        }

        res.json({
            success: true,
            message: 'Interest sent successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Interest already sent to this profile'
            });
        }
        console.error('Send interest error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send interest'
        });
    }
};

// Accept interest request
const acceptInterest = async (req, res) => {
    try {
        const userId = req.user.id;
        const interestId = req.params.id;

        // Get user's profile
        const [userProfile] = await query(
            'SELECT id FROM profiles WHERE user_id = ?',
            [userId]
        );

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Get interest request
        const [interest] = await query(
            'SELECT sender_id, receiver_id FROM interest_requests WHERE id = ? AND receiver_id = ?',
            [interestId, userProfile.id]
        );

        if (!interest) {
            return res.status(404).json({
                success: false,
                message: 'Interest request not found'
            });
        }

        // Update status
        await query(
            'UPDATE interest_requests SET status = ?, responded_at = NOW() WHERE id = ?',
            ['accepted', interestId]
        );

        // Get sender's user_id for notification
        const [senderProfile] = await query(
            'SELECT user_id FROM profiles WHERE id = ?',
            [interest.sender_id]
        );

        if (senderProfile) {
            // Create notification for sender
            await query(
                'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
                [
                    senderProfile.user_id,
                    'interest_accepted',
                    'Interest Accepted',
                    'Your interest request has been accepted',
                    userProfile.id
                ]
            );

            // Fetch sender's email and details
            const [senderUser] = await query('SELECT email FROM users WHERE id = ?', [senderProfile.user_id]);
            const [receiverDetails] = await query('SELECT first_name, last_name FROM profiles WHERE id = ?', [userProfile.id]);
            const [senderDetails] = await query('SELECT first_name, last_name FROM profiles WHERE id = ?', [interest.sender_id]);

            if (senderUser && receiverDetails && senderDetails) {
                sendEmailTemplate(senderUser.email, 'interest_accepted', {
                    recipientName: `${senderDetails.first_name} ${senderDetails.last_name}`,
                    senderName: `${receiverDetails.first_name} ${receiverDetails.last_name}`
                });
            }
        }

        res.json({
            success: true,
            message: 'Interest accepted successfully'
        });
    } catch (error) {
        console.error('Accept interest error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept interest'
        });
    }
};

// Reject interest request
const rejectInterest = async (req, res) => {
    try {
        const userId = req.user.id;
        const interestId = req.params.id;

        const [userProfile] = await query(
            'SELECT id FROM profiles WHERE user_id = ?',
            [userId]
        );

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const result = await query(
            'UPDATE interest_requests SET status = ?, responded_at = NOW() WHERE id = ? AND receiver_id = ?',
            ['rejected', interestId, userProfile.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Interest request not found'
            });
        }

        res.json({
            success: true,
            message: 'Interest rejected'
        });
    } catch (error) {
        console.error('Reject interest error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject interest'
        });
    }
};

module.exports = {
    getSentInterests,
    getReceivedInterests,
    sendInterest,
    acceptInterest,
    rejectInterest
};
