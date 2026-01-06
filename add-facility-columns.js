const mysql = require('mysql2/promise');

async function addFacilityColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    await connection.execute('ALTER TABLE facility_records ADD COLUMN application_status VARCHAR(20) DEFAULT "applied"');
    console.log('Successfully added application_status column to facility_records table');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addFacilityColumns();