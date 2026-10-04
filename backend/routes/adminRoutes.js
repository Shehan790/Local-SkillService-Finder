const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Protect all admin routes
router.use(verifyToken, authorizeRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/providers', adminController.getProviders);
router.patch('/providers/:id/verify', adminController.verifyProvider);
router.post('/categories', adminController.addCategory);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
