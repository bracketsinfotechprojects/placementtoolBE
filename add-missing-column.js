const mysql = require('mysql2/promise');

async function addMissingColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    await connection.execute('ALTER TABLE students ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE');
    console.log('Successfully added isDeleted column to students table');
    
    // Also check if we need to add it to other tables
    const tables = ['contact_details', 'visa_details', 'addresses', 'eligibility_status', 'student_lifestyle', 'placement_preferences', 'facility_records', 'address_change_requests', 'job_status_updates'];
    
    for (const table of tables) {
      try {
        // Check if table exists first
        await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
        await connection.execute(`ALTER TABLE ${table} ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE`);
        console.log(`Successfully added isDeleted column to ${table} table`);
      } catch (error) {
        console.log(`Table ${table} might not exist or already has isDeleted column`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addMissingColumn();