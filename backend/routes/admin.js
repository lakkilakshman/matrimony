const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    getPendingVerifications,
    verifyProfile,
    getAdminLogs,
    updateUserProfile,
    createUserProfile
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticateToken, isAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users/create', createUserProfile);
router.put('/users/:id/status', updateUserStatus);
router.get('/pending-verifications', getPendingVerifications);
router.put('/profiles/:id/verify', verifyProfile);
router.put('/users/:id/profile', updateUserProfile);
router.get('/logs', getAdminLogs);

module.exports = router;
