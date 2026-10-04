const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        console.log("Creating default Admin user...");
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        // Use INSERT IGNORE to prevent duplicate entry errors if run multiple times
        const [result] = await pool.execute(
            `INSERT IGNORE INTO users (name, email, phone, password_hash, role) 
             VALUES (?, ?, ?, ?, ?)`,
            ['Admin Superuser', 'admin@skillfinder.lk', '0000000000', passwordHash, 'admin']
        );
        
        if (result.affectedRows > 0) {
            console.log("✅ Admin user created successfully (email: admin@skillfinder.lk, password: admin123)");
        } else {
            console.log("ℹ️ Admin user already exists.");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
        process.exit(1);
    }
};

createAdmin();
