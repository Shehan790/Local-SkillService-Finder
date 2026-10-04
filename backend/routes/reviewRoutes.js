const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// POST /api/reviews
router.post('/', verifyToken, authorizeRoles('customer'), bookingController.addReview);

module.exports = router;
