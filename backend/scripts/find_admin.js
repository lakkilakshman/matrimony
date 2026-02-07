const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function findAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'matrimony_db'
        });

        const [rows] = await connection.execute('SELECT email FROM users WHERE role = "admin" LIMIT 1');

        if (rows.length > 0) {
            console.log('Admin found:', rows[0].email);
        } else {
            console.log('No admin user found.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

findAdmin();
