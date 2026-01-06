// Script to fix the missing overall_status column in eligibility_status table
const mysql = require('mysql2/promise');

// Database configuration from environment or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db'
};

async function fixOverallStatusColumn() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if eligibility_status table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'eligibility_status'");
    
    if (tables.length === 0) {
      console.log('❌ The eligibility_status table does not exist!');
      console.log('💡 Please run the main migration first: npm run migration:run');
      return;
    }
    
    console.log('\n🔍 Checking eligibility_status table structure...');
    
    // Check if overall_status column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM `eligibility_status` LIKE 'overall_status'"
    );
    
    if (columns.length > 0) {
      console.log('✅ overall_status column already exists');
      
      // Check the column type
      const columnInfo = columns[0];
      console.log(`📊 Column type: ${columnInfo.Type}`);
      console.log(`📊 Default value: ${columnInfo.Default}`);
      
    } else {
      console.log('🔄 Adding overall_status column...');
      
      // Add overall_status column
      await connection.execute(`
        ALTER TABLE \`eligibility_status\` 
        ADD COLUMN \`overall_status\` enum('eligible', 'not_eligible', 'pending', 'override') NOT NULL DEFAULT 'not_eligible'
      `);
      console.log('✅ Added overall_status column');
    }
    
    // Check if isDeleted column exists (for consistency)
    const [isdeletedColumns] = await connection.execute(
      "SHOW COLUMNS FROM `eligibility_status` LIKE 'isDeleted'"
    );
    
    if (isdeletedColumns.length === 0) {
      console.log('🔄 Adding isDeleted column for soft delete support...');
      await connection.execute(`
        ALTER TABLE \`eligibility_status\` 
        ADD COLUMN \`isDeleted\` tinyint NOT NULL DEFAULT 0
      `);
      console.log('✅ Added isDeleted column');
    } else {
      console.log('✅ isDeleted column already exists');
    }
    
    // Add indexes
    console.log('\n🔄 Adding performance indexes...');
    
    try {
      await connection.execute("CREATE INDEX `IDX_eligibility_status_overall` ON `eligibility_status` (`overall_status`)");
      console.log('✅ Created index for overall_status');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Index for overall_status already exists');
      } else {
        console.log('⚠️ Could not create overall_status index:', error.message);
      }
    }
    
    try {
      await connection.execute("CREATE INDEX `IDX_eligibility_isdeleted` ON `eligibility_status` (`isDeleted`)");
      console.log('✅ Created index for isDeleted');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Index for isDeleted already exists');
      } else {
        console.log('⚠️ Could not create isDeleted index:', error.message);
      }
    }
    
    // Final verification
    console.log('\n🧪 Testing eligibility status query...');
    try {
      const [result] = await connection.execute(
        'SELECT status_id, student_id, overall_status, isDeleted FROM eligibility_status LIMIT 1'
      );
      console.log('✅ Eligibility status query successful - overall_status column is accessible');
    } catch (error) {
      console.log('❌ Eligibility status query failed:', error.message);
    }
    
    console.log('\n🎉 Fix completed! The eligibility_status table now has all required columns.');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Column already exists (duplicate field error)');
    } else if (error.message.includes('Duplicate column name')) {
      console.log('✅ Column already exists');
    } else {
      console.error('❌ Error fixing overall_status column:', error.message);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
fixOverallStatusColumn();