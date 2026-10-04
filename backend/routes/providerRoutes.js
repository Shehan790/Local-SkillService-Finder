const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// GET /api/providers/search - Search providers by location
router.get('/search', providerController.searchProviders);

// GET /api/providers/categories - Fetch all service categories
router.get('/categories', providerController.getCategories);

// PUT /api/providers/profile - Update profile details (Protected: Providers only)
// IMPORTANT: Must be declared BEFORE /:id to prevent Express matching 'profile' as an ID
router.put('/profile', verifyToken, authorizeRoles('provider'), providerController.updateProfile);

// GET /api/providers/:id - Get full profile details
router.get('/:id', providerController.getProviderProfile);

module.exports = router;
