const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [[{ total_customers }]] = await pool.query(`SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'`);
        const [[{ total_providers }]] = await pool.query(`SELECT COUNT(*) as total_providers FROM users WHERE role = 'provider'`);
        const [bookingsData] = await pool.query(`SELECT status, COUNT(*) as count FROM bookings GROUP BY status`);
        const [[{ total_reviews }]] = await pool.query(`SELECT COUNT(*) as total_reviews FROM reviews`);

        const bookingsByStatus = {
            pending: 0,
            accepted: 0,
            completed: 0,
            cancelled: 0
        };

        bookingsData.forEach(b => {
            bookingsByStatus[b.status] = b.count;
        });

        res.json({
            customers: total_customers,
            providers: total_providers,
            bookings: bookingsByStatus,
            reviews: total_reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

exports.getProviders = async (req, res) => {
    try {
        const [providers] = await pool.query(`
            SELECT p.id as profile_id, u.id as user_id, u.name, u.email, u.phone, p.bio, p.hourly_rate, 
                   p.is_verified, p.is_available, p.average_rating, c.name as category_name
            FROM provider_profiles p
            JOIN users u ON p.user_id = u.id
            JOIN service_categories c ON p.category_id = c.id
        `);
        res.json({ providers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching providers' });
    }
};

exports.verifyProvider = async (req, res) => {
    try {
        const profileId = req.params.id;
        const { is_verified } = req.body; // Expecting boolean

        if (typeof is_verified !== 'boolean') {
            return res.status(400).json({ message: 'is_verified must be a boolean' });
        }

        const [result] = await pool.query(
            `UPDATE provider_profiles SET is_verified = ? WHERE id = ?`,
            [is_verified, profileId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        res.json({ message: 'Provider verification status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating provider status' });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name, icon_url } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const [result] = await pool.query(
            `INSERT INTO service_categories (name, icon_url) VALUES (?, ?)`,
            [name, icon_url || null]
        );

        res.status(201).json({ message: 'Category added', categoryId: result.insertId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Error adding category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const [result] = await pool.query(`DELETE FROM service_categories WHERE id = ?`, [categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete category because it is in use' });
        }
        res.status(500).json({ message: 'Error deleting category' });
    }
};
