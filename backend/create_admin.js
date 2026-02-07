const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'merukayana_matrimony'
        });

        console.log('Connected to database.');

        const email = 'admin@merukulam.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin user
        const [result] = await connection.execute(
            'INSERT INTO users (email, mobile, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
            [email, '9999999999', hashedPassword, 'admin', 'active']
        );

        console.log(`✅ Admin user created with ID: ${result.insertId}`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);

        await connection.end();
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

createAdmin();
