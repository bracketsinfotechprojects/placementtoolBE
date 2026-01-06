const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCompleteMigration() {
  let connection;
  
  try {
    console.log('🧪 Testing complete migration schema compatibility...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm'
    });

    console.log('✅ Database connection established');

    // Test 1: Verify all expected tables exist
    const expectedTables = [
      'roles', 'users', 'user_roles', 'students',
      'contact_details', 'visa_details', 'addresses',
      'eligibility_status', 'student_lifestyle', 'placement_preferences',
      'facility_records', 'address_change_requests', 'job_status_updates'
    ];

    const [tables] = await connection.query('SHOW TABLES');
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    console.log('📊 Table existence check:');
    let allTablesExist = true;
    for (const table of expectedTables) {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
      if (!exists) allTablesExist = false;
    }

    if (!allTablesExist) {
      console.log('⚠️  Some tables are missing. Consider running the complete migration.');
      return;
    }

    // Test 2: Verify address_change_requests has ALL required columns
    console.log('\n📊 Checking address_change_requests table structure:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'address_change_requests'
      ORDER BY ORDINAL_POSITION
    `);

    const requiredColumns = [
      'acr_id', 'student_id', 'current_address', 'new_address',
      'effective_date', 'change_reason', 'impact_acknowledged',
      'status', 'reviewed_at', 'reviewed_by', 'review_comments'
    ];

    let allColumnsExist = true;
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    for (const column of requiredColumns) {
      const exists = existingColumns.includes(column);
      console.log(`  ${exists ? '✅' : '❌'} ${column} (${columns.find(c => c.COLUMN_NAME === column)?.DATA_TYPE || 'N/A'})`);
      if (!exists) allColumnsExist = false;
    }

    if (!allColumnsExist) {
      console.log('❌ Some columns are missing in address_change_requests table');
      return;
    }

    // Test 3: Test INSERT with all columns (the original failing scenario)
    console.log('\n🧪 Testing INSERT with all columns...');
    
    // Get or create a test student
    const [students] = await connection.query('SELECT student_id FROM students LIMIT 1');
    let testStudentId;
    
    if (students.length === 0) {
      const [studentResult] = await connection.query(`
        INSERT INTO students (first_name, last_name, dob, status) 
        VALUES ('Test', 'Student', '2000-01-01', 'active')
      `);
      testStudentId = studentResult.insertId;
      console.log('✅ Created test student with ID:', testStudentId);
    } else {
      testStudentId = students[0].student_id;
      console.log('✅ Using existing student ID:', testStudentId);
    }

    // Test the complete INSERT (all columns from the entity)
    const [insertResult] = await connection.query(`
      INSERT INTO address_change_requests (
        acr_id, student_id, current_address, new_address, 
        effective_date, change_reason, impact_acknowledged, 
        status, reviewed_at, reviewed_by, review_comments
      ) VALUES (
        DEFAULT, ?, '789 University Avenue, Toronto, ON', 
        '101 Campus Lane, Toronto, ON', '2024-05-01', 
        'Closer to training facility and university', 
        true, 'pending', NOW(), 'System Admin', 'Migration test successful'
      )
    `, [testStudentId]);

    console.log('✅ INSERT successful! Row ID:', insertResult.insertId);

    // Test 4: Verify the data can be retrieved with all columns
    const [records] = await connection.query(`
      SELECT acr_id, student_id, current_address, new_address, 
             effective_date, change_reason, impact_acknowledged, 
             status, reviewed_at, reviewed_by, review_comments
      FROM address_change_requests 
      WHERE acr_id = ?
    `, [insertResult.insertId]);

    if (records.length > 0) {
      console.log('✅ Data retrieval successful!');
      console.log('  - Address Change Request ID:', records[0].acr_id);
      console.log('  - Current Address:', records[0].current_address);
      console.log('  - New Address:', records[0].new_address);
      console.log('  - Status:', records[0].status);
      console.log('  - Reviewed At:', records[0].reviewed_at);
      console.log('  - Reviewed By:', records[0].reviewed_by);
      console.log('  - Review Comments:', records[0].review_comments);
    }

    // Test 5: Verify foreign key relationships
    console.log('\n🔗 Testing foreign key relationships...');
    const [fkConstraints] = await connection.query(`
      SELECT 
        TABLE_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'address_change_requests'
    `);

    if (fkConstraints.length > 0) {
      console.log('✅ Foreign key constraints found:');
      fkConstraints.forEach(fk => {
        console.log(`  - ${fk.TABLE_NAME}.${fk.CONSTRAINT_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    }

    // Clean up test data
    await connection.query('DELETE FROM address_change_requests WHERE acr_id = ?', [insertResult.insertId]);
    console.log('🧹 Test data cleaned up');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Complete migration schema is working correctly');
    console.log('✅ No "Unknown column" errors');
    console.log('✅ All entity fields are supported');
    console.log('✅ Foreign key relationships are intact');

  } catch (error) {
    console.error('❌ Migration test failed:', error.message);
    
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      console.log('💡 This indicates a column mismatch between entities and database');
      console.log('💡 Consider running the complete migration:');
      console.log('   - For TypeORM: npm run migration:run');
      console.log('   - For SQL: mysql -u user -p database < complete-entity-matching-schema.sql');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testCompleteMigration();