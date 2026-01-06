const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    const [rows] = await connection.execute('DESCRIBE students');
    console.log('Students table structure:');
    console.log(rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkDatabase();