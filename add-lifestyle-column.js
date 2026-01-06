const mysql = require('mysql2/promise');

async function addLifestyleColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    await connection.execute('ALTER TABLE student_lifestyle ADD COLUMN additional_notes TEXT');
    console.log('Successfully added additional_notes column to student_lifestyle table');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addLifestyleColumns();