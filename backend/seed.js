const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
    try {
        console.log("Connected to database...");

        // Insert Categories
        const categories = [
            { id: 1, name: 'Plumber', icon_url: '' },
            { id: 2, name: 'Electrician', icon_url: '' },
            { id: 3, name: 'Tutor', icon_url: '' },
            { id: 4, name: 'Carpenter', icon_url: '' }
        ];

        for (const cat of categories) {
            await pool.execute(
                `INSERT IGNORE INTO service_categories (id, name, icon_url) VALUES (?, ?, ?)`,
                [cat.id, cat.name, cat.icon_url]
            );
        }
        console.log("Categories seeded...");

        const defaultPassword = await bcrypt.hash('password123', 10);

        const providers = [
            {
                name: 'Kamal Perera', email: 'kamal@example.com', phone: '0711111111', role: 'provider',
                lat: 6.9061, lng: 79.8560, category_id: 1, bio: 'Experienced plumber in Colombo 03.',
                hourly_rate: 1500, average_rating: 4.8
            },
            {
                name: 'Nimal Silva', email: 'nimal@example.com', phone: '0712222222', role: 'provider',
                lat: 6.8649, lng: 79.8997, category_id: 2, bio: 'Expert electrician in Nugegoda.',
                hourly_rate: 1800, average_rating: 4.9
            },
            {
                name: 'Sunil Fernando', email: 'sunil@example.com', phone: '0713333333', role: 'provider',
                lat: 6.8511, lng: 79.8630, category_id: 3, bio: 'Math and Science tutor in Dehiwala.',
                hourly_rate: 2000, average_rating: 4.7
            },
            {
                name: 'Ruwan Kumara', email: 'ruwan@example.com', phone: '0714444444', role: 'provider',
                lat: 6.9786, lng: 79.9272, category_id: 4, bio: 'Skilled carpenter for all furniture needs.',
                hourly_rate: 1200, average_rating: 4.5
            },
            {
                name: 'Chathura Bandara', email: 'chathura@example.com', phone: '0715555555', role: 'provider',
                lat: 7.0873, lng: 79.9924, category_id: 1, bio: 'Quick and reliable plumbing services in Gampaha.',
                hourly_rate: 1400, average_rating: 4.6
            }
        ];

        for (const p of providers) {
            // Check if user exists
            const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [p.email]);
            let userId;
            
            if (rows.length === 0) {
                const [userResult] = await pool.execute(
                    `INSERT INTO users (name, email, phone, password_hash, role, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [p.name, p.email, p.phone, defaultPassword, p.role, p.lat, p.lng]
                );
                userId = userResult.insertId;

                await pool.execute(
                    `INSERT INTO provider_profiles (user_id, category_id, bio, hourly_rate, is_available, is_verified, average_rating) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, p.category_id, p.bio, p.hourly_rate, true, true, p.average_rating]
                );
                console.log(`Seeded provider: ${p.name}`);
            } else {
                console.log(`Skipped existing user: ${p.email}`);
            }
        }

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

seedDB();
