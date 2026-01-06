// Script to check if isDeleted columns exist in the database
const mysql = require('mysql2/promise');

// Database configuration from environment or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db'
};

async function checkIsDeletedColumns() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check tables that should have isDeleted column
    const tables = ['students', 'users', 'roles'];
    
    console.log('\n🔍 Checking for isDeleted columns:');
    console.log('='.repeat(50));
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(
          `SHOW COLUMNS FROM \`${table}\` LIKE 'isDeleted'`
        );
        
        if (columns.length > 0) {
          console.log(`✅ Table '${table}': isDeleted column exists`);
        } else {
          console.log(`❌ Table '${table}': isDeleted column is missing`);
        }
      } catch (error) {
        console.log(`⚠️  Table '${table}': Error checking column - ${error.message}`);
      }
    }
    
    // Test a simple query on students table to ensure no "Unknown column" errors
    console.log('\n🧪 Testing student query...');
    try {
      const [result] = await connection.execute('SELECT student_id, first_name, last_name, isDeleted FROM students LIMIT 1');
      console.log('✅ Student query successful - isDeleted column is accessible');
    } catch (error) {
      console.log('❌ Student query failed:', error.message);
      console.log('💡 This suggests the isDeleted column is still missing');
    }
    
  } catch (error) {
    console.error('❌ Error checking columns:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the check
checkIsDeletedColumns();