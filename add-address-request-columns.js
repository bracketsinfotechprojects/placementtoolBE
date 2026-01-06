const mysql = require('mysql2/promise');

async function addAddressRequestColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    // Check if status column exists, if not add it
    await connection.execute('ALTER TABLE address_change_requests ADD COLUMN status VARCHAR(20) DEFAULT "pending"');
    await connection.execute('ALTER TABLE address_change_requests ADD COLUMN reviewed_at TIMESTAMP NULL');
    await connection.execute('ALTER TABLE address_change_requests ADD COLUMN reviewed_by VARCHAR(100) NULL');
    await connection.execute('ALTER TABLE address_change_requests ADD COLUMN review_comments TEXT NULL');
    console.log('Successfully added missing columns to address_change_requests table');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addAddressRequestColumns();