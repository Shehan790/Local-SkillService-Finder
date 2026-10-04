const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
    try {
        console.log("Connecting to MySQL to create database...");
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            multipleStatements: true
        });

        await conn.query('CREATE DATABASE IF NOT EXISTS skill_service_db;');
        console.log("Database 'skill_service_db' created or already exists.");
        
        await conn.query('USE skill_service_db;');
        
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await conn.query(schema);
        console.log("Schema applied successfully.");
        
        await conn.end();
        process.exit(0);
    } catch (error) {
        console.error("Setup failed:", error);
        process.exit(1);
    }
}

setup();
