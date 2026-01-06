// Script to clear all data from all tables while preserving table structure
const mysql = require('mysql2/promise');

// Database configuration from environment or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Atul%402626',
  database: process.env.DB_NAME || 'crm_db'
};

async function clearAllData() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    console.log('🗑️  Clearing all data from tables...');
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks disabled');
    
    // List of tables in dependency order (child tables first)
    const tables = [
      'job_status_updates',
      'address_change_requests', 
      'facility_records',
      'placement_preferences',
      'student_lifestyle',
      'eligibility_status',
      'addresses',
      'visa_details',
      'contact_details',
      'students',
      'user_roles',
      'users',
      'roles'
    ];
    
    // Clear data from each table
    for (const table of tables) {
      try {
        const [result] = await connection.execute(`DELETE FROM \`${table}\``);
        console.log(`✅ Cleared ${table}: ${result.affectedRows} rows deleted`);
      } catch (error) {
        console.log(`⚠️  Error clearing ${table}:`, error.message);
      }
    }
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks re-enabled');
    
    // Verify tables are empty
    console.log('\n📊 Verification - Row counts after clearing:');
    console.log('='.repeat(50));
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        const count = rows[0].count;
        console.log(`${table}: ${count} rows`);
      } catch (error) {
        console.log(`${table}: Error checking count - ${error.message}`);
      }
    }
    
    console.log('\n🎉 All data cleared successfully!');
    console.log('📝 Table structures preserved');
    console.log('🔄 Ready for fresh data insertion');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    
    // Try to re-enable foreign key checks even if there's an error
    if (connection) {
      try {
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🔒 Foreign key checks re-enabled');
      } catch (reEnableError) {
        console.log('⚠️  Could not re-enable foreign key checks:', reEnableError.message);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Show usage if called directly
if (require.main === module) {
  console.log('🧹 Database Data Clear Script');
  console.log('================================');
  console.log('This script will delete ALL data from all tables');
  console.log('but preserve the table structures.');
  console.log('');
  
  clearAllData().then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { clearAllData };