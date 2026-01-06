const mysql = require('mysql2/promise');

async function clearTestData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    await connection.execute('DELETE FROM contact_details WHERE email LIKE "%@example.com"');
    await connection.execute('DELETE FROM students WHERE first_name IN ("Rahul", "Priya")');
    console.log('Test data cleared successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

clearTestData();