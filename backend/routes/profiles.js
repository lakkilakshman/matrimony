const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const {
    getAllProfiles,
    getProfileById,
    updateProfile,
    searchProfiles,
    uploadProfileImages,
    getProfilePhotos,
    deleteProfilePhoto
} = require('../controllers/profileController');

// Public routes (with optional auth for tracking views)
router.get('/', getAllProfiles);
router.get('/search', searchProfiles);
router.get('/:id', optionalAuth, getProfileById);

// Protected routes
router.put('/:id', authenticateToken, updateProfile);

// Image upload route
router.post('/:id/upload-images', authenticateToken, uploadMultiple, handleUploadError, uploadProfileImages);

// Get profile photos route
router.get('/:id/photos', authenticateToken, getProfilePhotos);

// Delete profile photo route
router.delete('/:id/photos/:photoId', authenticateToken, deleteProfilePhoto);

module.exports = router;
