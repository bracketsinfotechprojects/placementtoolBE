const mysql = require('mysql2/promise');

async function addEligibilityColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    await connection.execute('ALTER TABLE eligibility_status ADD COLUMN overall_status VARCHAR(20) DEFAULT "pending"');
    console.log('Successfully added overall_status column to eligibility_status table');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addEligibilityColumn();