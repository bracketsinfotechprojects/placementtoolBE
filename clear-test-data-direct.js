// Direct clear test data
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Atul@2626',
  database: process.env.DB_NAME || 'testCRM'
};

async function clearTestData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    console.log('🗑️  Clearing all test data...');
    
    // Clear in reverse dependency order
    await connection.execute('DELETE FROM job_status_updates');
    await connection.execute('DELETE FROM address_change_requests');
    await connection.execute('DELETE FROM facility_records');
    await connection.execute('DELETE FROM placement_preferences');
    await connection.execute('DELETE FROM student_lifestyle');
    await connection.execute('DELETE FROM eligibility_status');
    await connection.execute('DELETE FROM addresses');
    await connection.execute('DELETE FROM visa_details');
    await connection.execute('DELETE FROM contact_details');
    await connection.execute('DELETE FROM students');
    
    console.log('✅ All test data cleared');
    
    // Reset auto-increment
    await connection.execute('ALTER TABLE students AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE contact_details AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE visa_details AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE addresses AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE eligibility_status AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE student_lifestyle AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE placement_preferences AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE facility_records AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE address_change_requests AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE job_status_updates AUTO_INCREMENT = 1');
    
    console.log('✅ Auto-increment counters reset');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

clearTestData();