const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];

        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        let decoded;
        try {
            console.log(`[Auth] Verifying token: ${token.substring(0, 10)}... using secret: ${process.env.JWT_SECRET ? 'SET' : 'MISSING'}`);
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[Auth] Token verified. User ID:', decoded.userId);
        } catch (verifyError) {
            console.error('[Auth] Verification failed:', verifyError.message);
            throw verifyError;
        }

        // Get user from database
        const users = await query(
            'SELECT id, email, mobile, role, status FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        const user = users[0];

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive or suspended.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        console.error('❌ Authentication error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users = await query(
                'SELECT id, email, mobile, role, status FROM users WHERE id = ?',
                [decoded.userId]
            );

            if (users.length > 0 && users[0].status === 'active') {
                req.user = users[0];
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    authenticateToken,
    isAdmin,
    optionalAuth
};
