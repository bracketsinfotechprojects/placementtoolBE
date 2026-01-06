// Database connection test script
// This helps verify database connectivity before running other scripts

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('='.repeat(50));
  
  // Try different configurations
  const configs = [
    {
      name: 'Environment Variables',
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'crm_db'
      }
    },
    {
      name: 'Default Configuration',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'crm_db'
      }
    },
    {
      name: 'No Password (Development)',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: ''
      }
    }
  ];

  let connection = null;
  
  for (const configOption of configs) {
    try {
      console.log(`\n🔄 Trying: ${configOption.name}`);
      console.log(`   Host: ${configOption.config.host}`);
      console.log(`   User: ${configOption.config.user}`);
      console.log(`   Database: ${configOption.config.database || '(none)'}`);
      
      connection = await mysql.createConnection(configOption.config);
      
      // Test with a simple query
      const [rows] = await connection.execute('SELECT 1 as test');
      
      if (rows.length > 0 && rows[0].test === 1) {
        console.log('✅ Connection successful!');
        
        // Try to show database info
        try {
          const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as mysql_version');
          console.log(`📊 Current Database: ${dbInfo[0].current_db || 'None selected'}`);
          console.log(`📊 MySQL Version: ${dbInfo[0].mysql_version}`);
        } catch (infoError) {
          console.log('⚠️  Could not get database info:', infoError.message);
        }
        
        // Check if our tables exist
        try {
          const [tables] = await connection.execute('SHOW TABLES');
          console.log(`📋 Found ${tables.length} tables:`);
          tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`   ${index + 1}. ${tableName}`);
          });
        } catch (tablesError) {
          console.log('⚠️  Could not list tables:', tablesError.message);
        }
        
        break; // Success, exit loop
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      if (connection) {
        await connection.end();
        connection = null;
      }
    }
  }
  
  if (!connection) {
    console.log('\n🚨 All connection attempts failed!');
    console.log('\n💡 Possible solutions:');
    console.log('   1. Set environment variables:');
    console.log('      export DB_HOST=localhost');
    console.log('      export DB_USER=your_username');
    console.log('      export DB_PASSWORD=your_password');
    console.log('      export DB_NAME=your_database');
    console.log('\n   2. Check MySQL server is running');
    console.log('   3. Verify database user permissions');
    console.log('   4. Create database if it doesn\'t exist:');
    console.log('      CREATE DATABASE crm_db;');
    
    return false;
  }
  
  // Close connection
  await connection.end();
  console.log('\n🔌 Connection test completed successfully!');
  return true;
}

// Run the test
if (require.main === module) {
  testConnection()
    .then((success) => {
      if (success) {
        console.log('\n✅ Database is ready for use!');
        process.exit(0);
      } else {
        console.log('\n❌ Database connection needs attention');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testConnection };