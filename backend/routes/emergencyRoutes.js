const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Customer creating an emergency SOS
router.post('/', verifyToken, authorizeRoles('customer'), emergencyController.createEmergency);

// Provider fetching nearby open emergencies
router.get('/nearby', verifyToken, authorizeRoles('provider'), emergencyController.getNearbyEmergency);

// Provider accepting an emergency (race-condition protected)
router.post('/:id/accept', verifyToken, authorizeRoles('provider'), emergencyController.acceptEmergency);

module.exports = router;
