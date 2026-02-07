const { query } = require('../config/database');
const { sendEmailTemplate } = require('../utils/emailService');
const path = require('path');
const fs = require('fs').promises;

// Get all active subscription plans
const getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await query(
            'SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY display_order ASC'
        );

        res.json({
            success: true,
            data: plans.map(plan => ({
                ...plan,
                features: JSON.parse(plan.features || '[]')
            }))
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription plans'
        });
    }
};

// Get payment settings (bank details, UPI, QR code)
const getPaymentSettings = async (req, res) => {
    try {
        const settings = await query(
            'SELECT * FROM payment_settings WHERE is_active = TRUE LIMIT 1'
        );

        if (settings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment settings not configured'
            });
        }

        res.json({
            success: true,
            data: settings[0]
        });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment settings'
        });
    }
};

// Create new payment (with proof upload)
const createPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { plan_id, payment_method, transaction_id } = req.body;

        // Validate required fields
        if (!plan_id || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID and payment method are required'
            });
        }

        // Check if payment proof was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Payment proof is required'
            });
        }

        // Get plan details
        const plans = await query(
            'SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE',
            [plan_id]
        );

        if (plans.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid subscription plan'
            });
        }

        const plan = plans[0];
        const paymentProofPath = `/uploads/payment-proofs/${req.file.filename}`;

        // Create payment record
        const result = await query(
            `INSERT INTO payments (user_id, plan_id, amount, payment_method, transaction_id, payment_proof, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, plan_id, plan.price, payment_method, transaction_id || null, paymentProofPath]
        );

        // Update user subscription status to pending
        await query(
            `UPDATE users SET subscription_status = 'pending' WHERE id = ?`,
            [userId]
        );

        res.status(201).json({
            success: true,
            message: 'Payment submitted successfully. Awaiting admin approval.',
            data: {
                payment_id: result.insertId,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit payment'
        });
    }
};

// Get user's payment history
const getUserPayments = async (req, res) => {
    try {
        const userId = req.user.id;

        const payments = await query(
            `SELECT p.*, sp.name as plan_name, sp.duration_months
       FROM payments p
       JOIN subscription_plans sp ON p.plan_id = sp.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching user payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history'
        });
    }
};

// Admin: Get all payments with filters
const getAllPayments = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            whereClause = 'WHERE p.status = ?';
            params.push(status);
        }

        const payments = await query(
            `SELECT p.*, 
              sp.name as plan_name, 
              sp.duration_months,
              u.email as user_email,
              u.mobile as user_mobile,
              CONCAT(pr.first_name, ' ', pr.last_name) as user_name
       FROM payments p
       JOIN subscription_plans sp ON p.plan_id = sp.id
       JOIN users u ON p.user_id = u.id
       LEFT JOIN profiles pr ON u.id = pr.user_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) as total FROM payments p ${whereClause}`,
            params
        );

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total
            }
        });
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments'
        });
    }
};

// Admin: Approve payment
const approvePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const { admin_notes } = req.body;

        // Get payment details
        const payments = await query(
            `SELECT p.*, sp.duration_months 
       FROM payments p
       JOIN subscription_plans sp ON p.plan_id = sp.id
       WHERE p.id = ?`,
            [id]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const payment = payments[0];

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment has already been processed'
            });
        }

        // Calculate subscription dates
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + payment.duration_months);

        // Update payment status
        await query(
            `UPDATE payments 
       SET status = 'approved', 
           approved_by = ?, 
           approved_at = NOW(),
           admin_notes = ?
       WHERE id = ?`,
            [adminId, admin_notes || null, id]
        );

        // Update user subscription
        await query(
            `UPDATE users 
       SET subscription_plan_id = ?,
           subscription_status = 'active',
           subscription_started_at = ?,
           subscription_expires_at = ?
       WHERE id = ?`,
            [payment.plan_id, startDate, expiryDate, payment.user_id]
        );

        // Send confirmation email
        const [userData] = await query('SELECT email FROM users WHERE id = ?', [payment.user_id]);
        const [profileData] = await query('SELECT first_name, last_name FROM profiles WHERE user_id = ?', [payment.user_id]);

        if (userData && profileData) {
            sendEmailTemplate(userData.email, 'payment_approved', {
                name: `${profileData.first_name} ${profileData.last_name}`,
                planName: payment.plan_name,
                expiryDate: expiryDate.toLocaleDateString()
            });
        }

        res.json({
            success: true,
            message: 'Payment approved and subscription activated'
        });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve payment'
        });
    }
};

// Admin: Reject payment
const rejectPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const { admin_notes } = req.body;

        // Get payment details
        const payments = await query('SELECT * FROM payments WHERE id = ?', [id]);

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const payment = payments[0];

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment has already been processed'
            });
        }

        // Update payment status
        await query(
            `UPDATE payments 
       SET status = 'rejected', 
           approved_by = ?, 
           rejected_at = NOW(),
           admin_notes = ?
       WHERE id = ?`,
            [adminId, admin_notes || 'Payment rejected', id]
        );

        // Update user subscription status
        await query(
            `UPDATE users 
       SET subscription_status = 'none'
       WHERE id = ?`,
            [payment.user_id]
        );

        // Send rejection email
        const [userData] = await query('SELECT email FROM users WHERE id = ?', [payment.user_id]);
        const [profileData] = await query('SELECT first_name, last_name FROM profiles WHERE user_id = ?', [payment.user_id]);

        if (userData && profileData) {
            sendEmailTemplate(userData.email, 'payment_rejected', {
                name: `${profileData.first_name} ${profileData.last_name}`,
                reason: admin_notes || 'Payment proof verification failed'
            });
        }

        res.json({
            success: true,
            message: 'Payment rejected'
        });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject payment'
        });
    }
};

// Admin: Update payment settings
const updatePaymentSettings = async (req, res) => {
    try {
        const {
            bank_name,
            account_number,
            ifsc_code,
            account_holder_name,
            branch_name,
            upi_id
        } = req.body;

        let qrCodePath = undefined;
        if (req.file) {
            qrCodePath = `/uploads/payment-proofs/${req.file.filename}`;
        }

        // Check if settings exist
        const settings = await query('SELECT id FROM payment_settings LIMIT 1');

        if (settings.length === 0) {
            // Insert new settings
            await query(
                `INSERT INTO payment_settings (
                    bank_name, account_number, ifsc_code, account_holder_name, 
                    branch_name, upi_id, qr_code_image, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
                [
                    bank_name, account_number, ifsc_code, account_holder_name,
                    branch_name, upi_id, qrCodePath || null
                ]
            );
        } else {
            // Update existing settings
            let updateQuery = `
                UPDATE payment_settings 
                SET bank_name = ?, 
                    account_number = ?, 
                    ifsc_code = ?, 
                    account_holder_name = ?, 
                    branch_name = ?, 
                    upi_id = ?
            `;
            let params = [
                bank_name, account_number, ifsc_code, account_holder_name,
                branch_name, upi_id
            ];

            if (qrCodePath) {
                updateQuery += `, qr_code_image = ?`;
                params.push(qrCodePath);
            }

            updateQuery += ` WHERE id = ?`;
            params.push(settings[0].id);

            await query(updateQuery, params);
        }

        res.json({
            success: true,
            message: 'Payment settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment settings'
        });
    }
};

module.exports = {
    getSubscriptionPlans,
    getPaymentSettings,
    createPayment,
    getUserPayments,
    getAllPayments,
    approvePayment,
    rejectPayment,
    updatePaymentSettings
};
