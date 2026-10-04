const pool = require('../config/db');

// Generate random 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

exports.createBooking = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { provider_id, service_date, problem_description, agreed_price } = req.body;

        if (!provider_id || !service_date) {
            return res.status(400).json({ message: 'Provider ID and service date are required' });
        }

        const otp = generateOTP();

        const query = `
            INSERT INTO bookings 
            (customer_id, provider_id, service_date, problem_description, agreed_price, completion_otp, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `;
        const [result] = await pool.query(query, [
            customerId, provider_id, service_date, problem_description, agreed_price || null, otp
        ]);

        res.status(201).json({ 
            message: 'Booking created successfully', 
            bookingId: result.insertId,
            otp: otp // Giving OTP to customer to hold onto
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error creating booking' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = `
            SELECT b.*, 
                   c.name AS customer_name, c.phone AS customer_phone,
                   p.name AS provider_name, p.phone AS provider_phone
            FROM bookings b
            JOIN users c ON b.customer_id = c.id
            JOIN users p ON b.provider_id = p.id
        `;

        const queryParams = [];

        if (role === 'customer') {
            query += ` WHERE b.customer_id = ? ORDER BY b.service_date DESC`;
            queryParams.push(userId);
        } else if (role === 'provider') {
            query += ` WHERE b.provider_id = ? ORDER BY b.service_date DESC`;
            queryParams.push(userId);
        } else {
            query += ` ORDER BY b.service_date DESC`;
        }

        const [bookings] = await pool.query(query, queryParams);
        
        // Hide OTP from provider until booking is complete to ensure trust
        if (role === 'provider') {
            bookings.forEach(b => {
                delete b.completion_otp;
            });
        }

        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Server error fetching bookings' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const providerId = req.user.id;
        const bookingId = req.params.id;
        const { status } = req.body;

        if (!['accepted', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Can only accept or cancel.' });
        }

        const [booking] = await pool.query('SELECT * FROM bookings WHERE id = ? AND provider_id = ?', [bookingId, providerId]);

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found or not authorized' });
        }

        if (booking[0].status === 'completed') {
            return res.status(400).json({ message: 'Cannot change status of a completed booking' });
        }

        await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);

        res.status(200).json({ message: `Booking status updated to ${status}` });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error updating booking status' });
    }
};

exports.completeBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const bookingId = req.params.id;
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: 'Completion OTP is required' });
        }

        const [booking] = await pool.query('SELECT * FROM bookings WHERE id = ? AND provider_id = ?', [bookingId, providerId]);

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found or not authorized' });
        }

        if (booking[0].status !== 'accepted') {
            return res.status(400).json({ message: 'Booking must be in accepted status to be completed' });
        }

        if (booking[0].completion_otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['completed', bookingId]);

        res.status(200).json({ message: 'Booking completed successfully' });
    } catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({ message: 'Server error completing booking' });
    }
};

exports.addReview = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { booking_id, rating, comment } = req.body;

        if (!booking_id || !rating) {
            return res.status(400).json({ message: 'Booking ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Check if booking belongs to customer and is completed
            const [booking] = await connection.query('SELECT * FROM bookings WHERE id = ? AND customer_id = ?', [booking_id, customerId]);
            
            if (booking.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Booking not found' });
            }

            if (booking[0].status !== 'completed') {
                await connection.rollback();
                return res.status(400).json({ message: 'Can only review completed bookings' });
            }

            // 2. Check if review already exists
            const [existingReview] = await connection.query('SELECT id FROM reviews WHERE booking_id = ?', [booking_id]);
            if (existingReview.length > 0) {
                await connection.rollback();
                return res.status(400).json({ message: 'Review already submitted for this booking' });
            }

            const providerId = booking[0].provider_id;

            // 3. Insert review
            await connection.query(
                'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
                [booking_id, customerId, providerId, rating, comment || null]
            );

            // 4. Recalculate average rating
            const [avgResult] = await connection.query(
                'SELECT AVG(rating) as avgRating FROM reviews WHERE provider_id = ?',
                [providerId]
            );

            const newAvg = parseFloat(avgResult[0].avgRating || 0).toFixed(2);

            // 5. Update provider_profiles with new average
            await connection.query(
                'UPDATE provider_profiles SET average_rating = ? WHERE user_id = ?',
                [newAvg, providerId]
            );

            await connection.commit();
            res.status(201).json({ message: 'Review submitted successfully' });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server error adding review' });
    }
};
