// Database setup helper script
// This script helps set up the database and user permissions

const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🛠️  Database Setup Helper');
  console.log('='.repeat(50));
  
  // Configuration
  const dbName = 'crm_db';
  const dbUser = 'crm_user';
  const dbPassword = 'secure_password_123'; // In production, use environment variables
  
  console.log('\n📋 Setup Configuration:');
  console.log(`   Database Name: ${dbName}`);
  console.log(`   Database User: ${dbUser}`);
  console.log(`   Database Password: ${dbPassword}`);
  
  // First, try to connect as root to set up database and user
  let rootConnection = null;
  
  try {
    console.log('\n🔄 Connecting to MySQL as root...');
    
    // Try connecting as root without password first
    rootConnection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });
    
    console.log('✅ Connected to MySQL as root');
    
    // Create database if it doesn't exist
    console.log(`\n📊 Creating database '${dbName}'...`);
    await rootConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' ready`);
    
    // Create user if it doesn't exist and grant permissions
    console.log(`\n👤 Setting up user '${dbUser}'...`);
    
    // Create user (ignore error if user already exists)
    try {
      await rootConnection.execute(`CREATE USER '${dbUser}'@'localhost' IDENTIFIED BY '${dbPassword}'`);
      console.log(`✅ User '${dbUser}' created`);
    } catch (userError) {
      if (userError.message.includes('already exists')) {
        console.log(`ℹ️  User '${dbUser}' already exists`);
      } else {
        throw userError;
      }
    }
    
    // Grant all privileges on the database
    await rootConnection.execute(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost'`);
    await rootConnection.execute('FLUSH PRIVILEGES');
    console.log(`✅ Permissions granted to '${dbUser}'`);
    
    // Test connection with new user
    console.log('\n🔄 Testing connection with new user...');
    const userConnection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
    
    console.log('✅ Connection successful with new user!');
    
    // Show current database info
    const [dbInfo] = await userConnection.execute('SELECT DATABASE() as current_db, VERSION() as mysql_version, USER() as current_user');
    console.log(`📊 Current Database: ${dbInfo[0].current_db}`);
    console.log(`📊 MySQL Version: ${dbInfo[0].mysql_version}`);
    console.log(`📊 Current User: ${dbInfo[0].current_user}`);
    
    await userConnection.end();
    
  } catch (error) {
    console.log(`\n❌ Setup failed: ${error.message}`);
    
    if (error.message.includes('Access denied')) {
      console.log('\n💡 Manual setup required:');
      console.log('   You need to run these commands manually as MySQL root user:');
      console.log('');
      console.log(`   mysql -u root -p`);
      console.log('');
      console.log(`   CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log(`   CREATE USER '${dbUser}'@'localhost' IDENTIFIED BY '${dbPassword}';`);
      console.log(`   GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost';`);
      console.log('   FLUSH PRIVILEGES;');
      console.log('   EXIT;');
      console.log('');
      console.log('   Then set these environment variables:');
      console.log(`   export DB_HOST=localhost`);
      console.log(`   export DB_USER=${dbUser}`);
      console.log(`   export DB_PASSWORD=${dbPassword}`);
      console.log(`   export DB_NAME=${dbName}`);
    }
    
    return false;
  } finally {
    if (rootConnection) {
      await rootConnection.end();
    }
  }
  
  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Set environment variables:');
  console.log(`      export DB_HOST=localhost`);
  console.log(`      export DB_USER=${dbUser}`);
  console.log(`      export DB_PASSWORD=${dbPassword}`);
  console.log(`      export DB_NAME=${dbName}`);
  console.log('');
  console.log('   2. Run the database migrations');
  console.log('');
  console.log('   3. Test the connection: node test-connection.js');
  
  return true;
}

// Check if MySQL is running
async function checkMySQLService() {
  console.log('\n🔍 Checking MySQL service status...');
  
  try {
    // Try to connect to MySQL
    await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });
    console.log('✅ MySQL service is running');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ MySQL service is not running');
      console.log('\n💡 To start MySQL service:');
      console.log('   Windows: net start mysql');
      console.log('   macOS: brew services start mysql');
      console.log('   Linux: sudo systemctl start mysql');
      return false;
    }
    throw error;
  }
}

// Run the setup
async function main() {
  console.log('🚀 Starting database setup...\n');
  
  // Check if MySQL is running
  const mysqlRunning = await checkMySQLService();
  if (!mysqlRunning) {
    console.log('\n❌ Cannot proceed without MySQL service running');
    return false;
  }
  
  // Run setup
  const success = await setupDatabase();
  
  if (success) {
    console.log('\n✅ Setup completed! You can now run your application.');
  } else {
    console.log('\n❌ Setup failed. Please check the error messages above.');
  }
  
  return success;
}

// Run the script
if (require.main === module) {
  main()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase, checkMySQLService };