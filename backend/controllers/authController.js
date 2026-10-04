const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    const { name, email, phone, password, role, lat, lng, category_id } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check if user already exists
        const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Email already in use' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userRole = role || 'customer';

        // 3. Insert user
        const [userResult] = await connection.query(
            'INSERT INTO users (name, email, phone, password_hash, role, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, passwordHash, userRole, lat || null, lng || null]
        );

        const userId = userResult.insertId;

        // 4. If provider, initialize provider profile
        if (userRole === 'provider') {
            if (!category_id) {
                await connection.rollback();
                return res.status(400).json({ message: 'Category ID is required for providers' });
            }
            await connection.query(
                'INSERT INTO provider_profiles (user_id, category_id) VALUES (?, ?)',
                [userId, category_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'User registered successfully', userId });

    } catch (error) {
        await connection.rollback();
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    } finally {
        connection.release();
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // 1. Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Generate JWT
        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                lat: user.lat,
                lng: user.lng
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
