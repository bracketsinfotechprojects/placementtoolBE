const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearDatabase() {
  let connection;
  
  try {
    console.log('🗑️ Clearing database...');
    
    // Connect without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Atul@2626',
      port: process.env.DB_PORT || 3306,
    });

    // Drop and recreate database
    await connection.execute(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'testCRM'}`);
    await connection.execute(`CREATE DATABASE ${process.env.DB_NAME || 'testCRM'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log('✅ Database cleared and recreated successfully!');

  } catch (error) {
    console.error('❌ Database clear failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

clearDatabase();