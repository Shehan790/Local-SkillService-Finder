const pool = require('../config/db');

exports.createEmergency = async (req, res) => {
    try {
        const { category_id, description, lat, lng, offered_price } = req.body;
        const customer_id = req.user.id;

        if (!category_id || !lat || !lng || !offered_price) {
            return res.status(400).json({ message: 'Missing required fields for emergency request' });
        }

        const [result] = await pool.query(
            `INSERT INTO emergency_requests (customer_id, category_id, description, lat, lng, offered_price) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [customer_id, category_id, description, lat, lng, offered_price]
        );

        res.status(201).json({ message: 'Emergency SOS Broadcasted successfully!', emergency_id: result.insertId });
    } catch (error) {
        console.error("Error creating emergency request:", error);
        res.status(500).json({ message: 'Error broadcasting emergency SOS' });
    }
};

exports.getNearbyEmergency = async (req, res) => {
    try {
        const provider_id = req.user.id;
        
        // Fetch provider's current location and category
        const [[provider]] = await pool.query(
            `SELECT u.lat, u.lng, p.category_id 
             FROM users u 
             JOIN provider_profiles p ON u.id = p.user_id 
             WHERE u.id = ?`,
            [provider_id]
        );

        if (!provider || !provider.lat || !provider.lng) {
            return res.status(400).json({ message: 'Provider location or profile not found.' });
        }

        const { lat, lng, category_id } = provider;
        const radiusKm = 10;

        // Haversine formula to find open requests within 10km for the provider's category
        const [requests] = await pool.query(
            `SELECT e.*, u.name as customer_name, u.phone as customer_phone,
             (6371 * acos(cos(radians(?)) * cos(radians(e.lat)) * cos(radians(e.lng) - radians(?)) + sin(radians(?)) * sin(radians(e.lat)))) AS distance
             FROM emergency_requests e
             JOIN users u ON e.customer_id = u.id
             WHERE e.status = 'open' AND e.category_id = ?
             HAVING distance <= ?
             ORDER BY distance ASC`,
            [lat, lng, lat, category_id, radiusKm]
        );

        res.json({ requests });
    } catch (error) {
        console.error("Error fetching nearby emergencies:", error);
        res.status(500).json({ message: 'Error fetching nearby emergency jobs' });
    }
};

exports.acceptEmergency = async (req, res) => {
    let connection;
    try {
        const emergency_id = req.params.id;
        const provider_id = req.user.id;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Atomic update to prevent race conditions
        const [updateResult] = await connection.query(
            `UPDATE emergency_requests 
             SET status = 'assigned', assigned_provider_id = ? 
             WHERE id = ? AND status = 'open'`,
            [provider_id, emergency_id]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Too late! Another provider just accepted this emergency job.' });
        }

        // Fetch the emergency details to create a booking
        const [[emergency]] = await connection.query(`SELECT * FROM emergency_requests WHERE id = ?`, [emergency_id]);
        
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP

        // Automatically insert the booking
        const [bookingResult] = await connection.query(
            `INSERT INTO bookings (customer_id, provider_id, service_date, problem_description, status, completion_otp, agreed_price)
             VALUES (?, ?, NOW(), ?, 'accepted', ?, ?)`,
            [emergency.customer_id, provider_id, `EMERGENCY SOS: ${emergency.description}`, otp, emergency.offered_price]
        );

        await connection.commit();
        res.json({ message: 'Emergency job accepted successfully!', booking_id: bookingResult.insertId, otp });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error accepting emergency request:", error);
        res.status(500).json({ message: 'Error accepting emergency job' });
    } finally {
        if (connection) connection.release();
    }
};
