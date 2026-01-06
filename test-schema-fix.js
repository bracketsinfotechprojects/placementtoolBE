const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSchemaFix() {
  let connection;
  
  try {
    console.log('🧪 Testing the schema fix...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm'
    });

    console.log('✅ Database connection established');

    // Test 1: Check if all required columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'address_change_requests'
      AND COLUMN_NAME IN ('reviewed_at', 'reviewed_by', 'review_comments')
      ORDER BY COLUMN_NAME
    `);

    console.log('📊 Required columns found:');
    columns.forEach(col => console.log(`  ✅ ${col.COLUMN_NAME}`));

    if (columns.length === 3) {
      console.log('✅ All required columns exist!');
    } else {
      console.log('❌ Some columns are missing');
      return;
    }

    // Test 2: Try to insert with all columns (using a simple approach)
    console.log('\n🧪 Testing INSERT with all columns...');
    
    // First, let's see if there are any students
    const [students] = await connection.query('SELECT student_id FROM students LIMIT 1');
    
    if (students.length === 0) {
      console.log('⚠️  No students found - creating test student first');
      
      // Create a test student
      const [studentResult] = await connection.query(`
        INSERT INTO students (first_name, last_name, dob, status) 
        VALUES ('Test', 'Student', '2000-01-01', 'active')
      `);
      console.log('✅ Test student created with ID:', studentResult.insertId);
      
      var testStudentId = studentResult.insertId;
    } else {
      var testStudentId = students[0].student_id;
      console.log('✅ Using existing student ID:', testStudentId);
    }

    // Test the INSERT with all columns
    const [insertResult] = await connection.query(`
      INSERT INTO address_change_requests (
        acr_id, student_id, current_address, new_address, 
        effective_date, change_reason, impact_acknowledged, 
        status, reviewed_at, reviewed_by, review_comments
      ) VALUES (
        DEFAULT, ?, '123 Old St', '456 New Ave', '2024-05-01', 
        'Test reason', true, 'pending', NOW(), 'Test Reviewer', 'Test comment'
      )
    `, [testStudentId]);

    console.log('✅ INSERT successful! Row ID:', insertResult.insertId);

    // Test 3: Read back the inserted record
    const [records] = await connection.query(`
      SELECT acr_id, current_address, new_address, reviewed_at, reviewed_by, review_comments 
      FROM address_change_requests 
      WHERE acr_id = ?
    `, [insertResult.insertId]);

    if (records.length > 0) {
      console.log('✅ Record retrieved successfully:');
      console.log('  - Current Address:', records[0].current_address);
      console.log('  - New Address:', records[0].new_address);
      console.log('  - Reviewed At:', records[0].reviewed_at);
      console.log('  - Reviewed By:', records[0].reviewed_by);
      console.log('  - Review Comments:', records[0].review_comments);
    }

    // Clean up test data
    await connection.query('DELETE FROM address_change_requests WHERE acr_id = ?', [insertResult.insertId]);
    console.log('🧹 Test data cleaned up');

    console.log('\n🎉 All tests passed! The schema fix is working correctly.');
    console.log('✅ The "Unknown column \'reviewed_at\'" error should now be resolved.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      console.log('💡 This indicates the column still doesn\'t exist. Check if the fix was applied correctly.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testSchemaFix();