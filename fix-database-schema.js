const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAddressChangeRequestsSchema() {
  let connection;
  
  try {
    console.log('🔧 Starting address_change_requests schema fix...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm',
      multipleStatements: true
    });
    
    console.log('✅ Database connection established');
    
    // Read and execute the SQL fix
    const fs = require('fs');
    const path = require('path');
    const sqlFilePath = path.join(__dirname, 'fix-address-change-requests-schema.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📝 Executing schema fix SQL...');
    const [results] = await connection.query(sqlCommands);
    
    console.log('✅ Schema fix completed successfully!');
    
    // Show current table structure
    console.log('\n📊 Current address_change_requests table structure:');
    const [tableStructure] = await connection.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_COMMENT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'address_change_requests'
      ORDER BY ORDINAL_POSITION
    `);
    
    tableStructure.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''}`);
    });
    
    // Test the original failing query to make sure it works now
    console.log('\n🧪 Testing original failing query...');
    try {
      const [testResult] = await connection.query(`
        INSERT INTO address_change_requests(
          acr_id, student_id, current_address, new_address, 
          effective_date, change_reason, impact_acknowledged, 
          status, reviewed_at, reviewed_by, review_comments
        ) VALUES (
          DEFAULT, 3, '789 University Avenue, Toronto, ON', 
          '101 Campus Lane, Toronto, ON', '2024-05-01', 
          'Closer to training facility and university', 
          true, DEFAULT, DEFAULT, DEFAULT, DEFAULT
        )
      `);
      console.log('✅ Test query executed successfully!');
      
      // Clean up test data
      await connection.query('DELETE FROM address_change_requests WHERE current_address = ?', ['789 University Avenue, Toronto, ON']);
      console.log('🧹 Test data cleaned up');
      
    } catch (testError) {
      console.error('❌ Test query still failing:', testError.message);
    }
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
fixAddressChangeRequestsSchema();