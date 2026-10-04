const pool = require('./config/db');

async function migrate() {
    try {
        console.log("Creating emergency_requests table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS emergency_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                category_id INT NOT NULL,
                description TEXT,
                lat DECIMAL(10, 8),
                lng DECIMAL(11, 8),
                offered_price DECIMAL(10, 2),
                status ENUM('open', 'assigned', 'cancelled') DEFAULT 'open',
                assigned_provider_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_provider_id) REFERENCES users(id) ON DELETE SET NULL
            );
        `);
        console.log("Table created successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
