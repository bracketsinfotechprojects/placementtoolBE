// Simple script to check if roles were inserted
const mysql = require('mysql2/promise');

// Database configuration from environment or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db'
};

async function checkRoles() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Query roles table
    const [rows] = await connection.execute('SELECT * FROM roles ORDER BY role_id');
    
    console.log('\n📋 Current roles in database:');
    console.log('='.repeat(40));
    
    if (rows.length === 0) {
      console.log('❌ No roles found in the database');
      console.log('💡 This means the migration might not have run successfully');
    } else {
      rows.forEach((role, index) => {
        console.log(`${index + 1}. ID: ${role.role_id} | Name: ${role.role_name} | Created: ${role.created_at}`);
      });
      console.log(`\n✅ Found ${rows.length} roles in the database`);
    }
    
    // Also check if tables exist
    const [tables] = await connection.execute("SHOW TABLES LIKE 'roles'");
    
    if (tables.length === 0) {
      console.log('\n❌ The roles table does not exist!');
      console.log('💡 You need to run the migration first');
    } else {
      console.log('\n✅ The roles table exists');
    }
    
  } catch (error) {
    console.error('❌ Error checking roles:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the check
checkRoles();