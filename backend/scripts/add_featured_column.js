const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'merukayana_matrimony'
};

async function migrate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Checking if is_featured column exists...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'profiles' AND COLUMN_NAME = 'is_featured'
        `, [dbConfig.database]);

        if (columns.length > 0) {
            console.log('Column is_featured already exists.');
        } else {
            console.log('Adding is_featured column...');
            await connection.execute(`
                ALTER TABLE profiles 
                ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER profile_status
            `);
            console.log('Column added successfully.');

            // Add index
            await connection.execute(`
                CREATE INDEX idx_featured ON profiles(is_featured)
            `);
            console.log('Index added successfully.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed.');
        }
    }
}

migrate();
