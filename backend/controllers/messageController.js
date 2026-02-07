const { query } = require('../config/database');
const { sendEmailTemplate } = require('../utils/emailService');

// Send a message
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({
                success: false,
                message: 'Receiver ID and message are required'
            });
        }

        // Check subscription status
        const [sender] = await query('SELECT subscription_status, role FROM users WHERE id = ?', [senderId]);

        if (!sender) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (sender.role !== 'admin' && sender.subscription_status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Upgrade to Premium to send messages'
            });
        }

        const result = await query(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [senderId, receiverId, message]
        );

        // Also create a notification for the receiver
        await query(
            'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
            [
                receiverId,
                'message',
                'New Message',
                'You have received a new message',
                senderId
            ]
        );

        // Fetch details for email
        const [receiverUser] = await query('SELECT email FROM users WHERE id = ?', [receiverId]);
        const [senderProfile] = await query('SELECT first_name, last_name FROM profiles WHERE user_id = ?', [senderId]);
        const [receiverProfile] = await query('SELECT first_name, last_name FROM profiles WHERE user_id = ?', [receiverId]);

        if (receiverUser && senderProfile && receiverProfile) {
            sendEmailTemplate(receiverUser.email, 'message_received', {
                recipientName: `${receiverProfile.first_name} ${receiverProfile.last_name}`,
                senderName: `${senderProfile.first_name} ${senderProfile.last_name}`,
                messageSnippet: message.substring(0, 100) + (message.length > 100 ? '...' : '')
            });
        }

        res.json({
            success: true,
            data: {
                id: result.insertId,
                senderId,
                receiverId,
                message,
                sent_at: new Date()
            }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
};

// Get all conversations for the current user
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // This query gets the latest message from each conversation
        const conversations = await query(
            `SELECT 
                u.id as other_user_id,
                p.first_name,
                p.last_name,
                p.profile_photo,
                m.message as last_message,
                m.sent_at as last_message_at,
                (SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND sender_id = u.id AND is_read = FALSE) as unread_count
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            JOIN (
                SELECT 
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END as other_id,
                    MAX(sent_at) as max_date
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY other_id
            ) last_msgs ON u.id = last_msgs.other_id
            JOIN messages m ON (
                (m.sender_id = ? AND m.receiver_id = u.id) OR 
                (m.sender_id = u.id AND m.receiver_id = ?)
            ) AND m.sent_at = last_msgs.max_date
            ORDER BY last_message_at DESC`,
            [userId, userId, userId, userId, userId, userId]
        );

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.otherUserId;

        const messages = await query(
            `SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY sent_at ASC`,
            [userId, otherUserId, otherUserId, userId]
        );

        // Mark messages as read
        await query(
            'UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ?',
            [userId, otherUserId]
        );

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages
};
