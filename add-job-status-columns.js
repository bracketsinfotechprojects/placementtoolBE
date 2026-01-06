const mysql = require('mysql2/promise');

async function addJobStatusColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    await connection.execute('ALTER TABLE job_status_updates ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    console.log('Successfully added created_at column to job_status_updates table');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addJobStatusColumns();