// Script to safely add isDeleted column to students table
// This handles the case where the column might already exist
const mysql = require('mysql2/promise');

// Database configuration from environment or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db'
};

async function addIsDeletedToStudents() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if students table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'students'");
    
    if (tables.length === 0) {
      console.log('❌ The students table does not exist!');
      console.log('💡 Please run the main migration first');
      return;
    }
    
    // Check if isDeleted column already exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM `students` LIKE 'isDeleted'"
    );
    
    if (columns.length > 0) {
      console.log('✅ isDeleted column already exists in students table');
      
      // Check if index exists
      try {
        await connection.execute("SHOW INDEX FROM `students` WHERE Key_name = 'IDX_students_isdeleted'");
        console.log('✅ Index IDX_students_isdeleted already exists');
      } catch (indexError) {
        // Index doesn't exist, create it
        await connection.execute("CREATE INDEX `IDX_students_isdeleted` ON `students` (`isDeleted`)");
        console.log('✅ Created index IDX_students_isdeleted');
      }
      
      return;
    }
    
    // Add isDeleted column
    console.log('🔄 Adding isDeleted column to students table...');
    await connection.execute(`
      ALTER TABLE \`students\` 
      ADD COLUMN \`isDeleted\` tinyint NOT NULL DEFAULT 0
    `);
    console.log('✅ Added isDeleted column to students table');
    
    // Add index for performance
    console.log('🔄 Creating index for isDeleted column...');
    await connection.execute(`
      CREATE INDEX \`IDX_students_isdeleted\` ON \`students\` (\`isDeleted\`)
    `);
    console.log('✅ Created index IDX_students_isdeleted');
    
    // Verify the addition
    const [newColumns] = await connection.execute(
      "SHOW COLUMNS FROM `students` LIKE 'isDeleted'"
    );
    
    if (newColumns.length > 0) {
      console.log('\n🎉 Success! Students table now supports soft deletes');
      console.log(`📊 Column type: ${newColumns[0].Type}`);
      console.log(`📊 Default value: ${newColumns[0].Default}`);
    }
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ isDeleted column already exists (duplicate field error)');
    } else if (error.message.includes('Duplicate column name')) {
      console.log('✅ isDeleted column already exists');
    } else {
      console.error('❌ Error adding isDeleted column:', error.message);
      console.log('\n💡 If the column already exists, you can ignore this error.');
      console.log('💡 Try running: node verify-roles.js to check system status.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
addIsDeletedToStudents();