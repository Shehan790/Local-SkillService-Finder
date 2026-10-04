const pool = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM service_categories ORDER BY name ASC');
        res.json({ categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

exports.searchProviders = async (req, res) => {
    try {
        const { lat, lng, radius = 10, category_id, min_rating = 0 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        // Haversine formula for calculating distance in kilometers
        const distanceCalc = `
            6371 * acos(
                cos(radians(?)) * cos(radians(u.lat)) * cos(radians(u.lng) - radians(?)) +
                sin(radians(?)) * sin(radians(u.lat))
            )
        `;

        let query = `
            SELECT 
                p.id AS provider_id,
                u.id AS user_id,
                u.name,
                u.lat,
                u.lng,
                p.category_id,
                c.name AS category_name,
                p.bio,
                p.hourly_rate,
                p.average_rating,
                p.is_verified,
                (${distanceCalc}) AS distance
            FROM provider_profiles p
            JOIN users u ON p.user_id = u.id
            JOIN service_categories c ON p.category_id = c.id
            WHERE p.is_available = TRUE 
              AND p.average_rating >= ?
        `;

        const queryParams = [lat, lng, lat, min_rating];

        if (category_id) {
            query += ' AND p.category_id = ?';
            queryParams.push(category_id);
        }

        query += ` HAVING distance <= ? ORDER BY distance ASC, p.average_rating DESC`;
        queryParams.push(radius);

        const [providers] = await pool.query(query, queryParams);

        res.status(200).json({ providers });

    } catch (error) {
        console.error('Search providers error:', error);
        res.status(500).json({ message: 'Server error during provider search' });
    }
};

exports.getProviderProfile = async (req, res) => {
    try {
        const providerId = req.params.id;

        // Fetch provider profile details
        const profileQuery = `
            SELECT 
                p.id AS provider_id,
                u.id AS user_id,
                u.name,
                u.email,
                u.phone,
                u.lat,
                u.lng,
                c.name AS category_name,
                p.bio,
                p.hourly_rate,
                p.average_rating,
                p.is_verified,
                p.is_available
            FROM provider_profiles p
            JOIN users u ON p.user_id = u.id
            JOIN service_categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        const [profileResult] = await pool.query(profileQuery, [providerId]);

        if (profileResult.length === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        const provider = profileResult[0];

        // Fetch recent reviews for this provider's user_id
        const reviewsQuery = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                c.name AS customer_name
            FROM reviews r
            JOIN users c ON r.customer_id = c.id
            WHERE r.provider_id = ?
            ORDER BY r.created_at DESC
            LIMIT 10
        `;
        const [reviews] = await pool.query(reviewsQuery, [provider.user_id]);

        provider.reviews = reviews;

        res.status(200).json({ provider });

    } catch (error) {
        console.error('Get provider profile error:', error);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, hourly_rate, lat, lng, is_available } = req.body;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Update users table for location
            if (lat !== undefined && lng !== undefined) {
                await connection.query('UPDATE users SET lat = ?, lng = ? WHERE id = ?', [lat, lng, userId]);
            }

            // 2. Update provider_profiles table
            const updateFields = [];
            const queryParams = [];

            if (bio !== undefined) {
                updateFields.push('bio = ?');
                queryParams.push(bio);
            }
            if (hourly_rate !== undefined) {
                updateFields.push('hourly_rate = ?');
                queryParams.push(hourly_rate);
            }
            if (is_available !== undefined) {
                updateFields.push('is_available = ?');
                queryParams.push(is_available);
            }

            if (updateFields.length > 0) {
                const updateQuery = `UPDATE provider_profiles SET ${updateFields.join(', ')} WHERE user_id = ?`;
                queryParams.push(userId);
                await connection.query(updateQuery, queryParams);
            }

            await connection.commit();
            res.status(200).json({ message: 'Profile updated successfully' });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
