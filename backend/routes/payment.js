const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const {
    getSubscriptionPlans,
    getPaymentSettings,
    createPayment,
    getUserPayments,
    getAllPayments,
    approvePayment,
    rejectPayment,
    updatePaymentSettings
} = require('../controllers/paymentController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/payment-proofs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for payment proof uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs only
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: fileFilter
});

// Public routes
router.get('/plans', getSubscriptionPlans);
router.get('/settings', getPaymentSettings);

// Protected user routes
router.post('/', authenticateToken, upload.single('payment_proof'), createPayment);
router.get('/my-payments', authenticateToken, getUserPayments);

// Admin routes
router.get('/admin/all', authenticateToken, isAdmin, getAllPayments);
router.put('/admin/:id/approve', authenticateToken, isAdmin, approvePayment);
router.put('/admin/:id/reject', authenticateToken, isAdmin, rejectPayment);
router.put('/admin/settings', authenticateToken, isAdmin, upload.single('qr_code'), updatePaymentSettings);

module.exports = router;
