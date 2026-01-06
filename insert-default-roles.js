// Script to manually insert default roles if migration didn't work
const mysql = require('mysql2/promise');

// Database configuration from environment or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db'
};

async function insertDefaultRoles() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // First, check if roles table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'roles'");
    
    if (tables.length === 0) {
      console.log('❌ The roles table does not exist!');
      console.log('💡 Please run the migration first: npm run migration:run');
      return;
    }
    
    // Check current roles
    const [existingRoles] = await connection.execute('SELECT * FROM roles ORDER BY role_id');
    
    console.log('\n📋 Current roles in database:');
    console.log('='.repeat(40));
    
    if (existingRoles.length === 0) {
      console.log('⚠️ No roles found, inserting default roles...');
      
      // Insert default roles
      const defaultRoles = ['Admin', 'Facility', 'Supervisor', 'Placement Executive', 'Trainer', 'Student'];
      
      for (const roleName of defaultRoles) {
        try {
          await connection.execute(
            'INSERT IGNORE INTO roles (role_name) VALUES (?)',
            [roleName]
          );
          console.log(`✅ Inserted role: ${roleName}`);
        } catch (error) {
          console.log(`⚠️ Role '${roleName}' might already exist`);
        }
      }
      
      // Verify insertion
      const [newRoles] = await connection.execute('SELECT * FROM roles ORDER BY role_id');
      console.log(`\n📊 Total roles after insertion: ${newRoles.length}`);
      
    } else {
      console.log('⚠️ Roles already exist:');
      existingRoles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.role_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
insertDefaultRoles();