const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// GET /api/bookings/my-bookings
router.get('/my-bookings', verifyToken, bookingController.getMyBookings);

// POST /api/bookings
router.post('/', verifyToken, authorizeRoles('customer'), bookingController.createBooking);

// PATCH /api/bookings/:id/status
router.patch('/:id/status', verifyToken, authorizeRoles('provider'), bookingController.updateBookingStatus);

// POST /api/bookings/:id/complete
router.post('/:id/complete', verifyToken, authorizeRoles('provider'), bookingController.completeBooking);

module.exports = router;
