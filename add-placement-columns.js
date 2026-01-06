const mysql = require('mysql2/promise');

async function addPlacementColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Atul@2626',
    database: 'testCRM'
  });

  try {
    await connection.execute('ALTER TABLE placement_preferences ADD COLUMN urgency_level VARCHAR(20) DEFAULT "flexible"');
    await connection.execute('ALTER TABLE placement_preferences ADD COLUMN additional_preferences TEXT');
    console.log('Successfully added urgency_level and additional_preferences columns to placement_preferences table');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addPlacementColumns();