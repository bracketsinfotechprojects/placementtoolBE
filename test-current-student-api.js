const mysql = require('mysql2/promise');

async function testCurrentStudentAPI() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_db'
  });

  try {
    console.log('🧪 Testing current student API behavior...\n');

    // First, check current data
    console.log('📊 Current students count:');
    const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log(`Students: ${students[0].count}`);

    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`Users: ${users[0].count}`);

    const [userRoles] = await connection.execute('SELECT COUNT(*) as count FROM user_roles');
    console.log(`User roles: ${userRoles[0].count}\n`);

    // Test creating a student with email
    const testStudent = {
      first_name: 'Test',
      last_name: 'Student',
      dob: '1995-01-01',
      email: 'test.student@example.com'
    };

    console.log('📝 Creating test student...');
    
    // Create student
    const [studentResult] = await connection.execute(
      `INSERT INTO students (first_name, last_name, dob, status) VALUES (?, ?, ?, 'active')`,
      [testStudent.first_name, testStudent.last_name, testStudent.dob]
    );

    const studentId = studentResult.insertId;
    console.log(`✅ Student created with ID: ${studentId}`);

    // Create contact details with email
    await connection.execute(
      `INSERT INTO contact_details (student_id, email, is_primary) VALUES (?, ?, 1)`,
      [studentId, testStudent.email]
    );
    console.log(`✅ Contact details created with email: ${testStudent.email}`);

    // Check if user was automatically created
    const [userCheck] = await connection.execute(
      'SELECT * FROM users WHERE loginID = ?',
      [testStudent.email]
    );

    console.log('\n🔍 Checking if user was automatically created...');
    if (userCheck.length > 0) {
      console.log('✅ User account created automatically');
      console.log(`   User ID: ${userCheck[0].id}`);
      console.log(`   LoginID: ${userCheck[0].loginID}`);
      console.log(`   UserRole: ${userCheck[0].userRole}`);
      console.log(`   Status: ${userCheck[0].status}`);
    } else {
      console.log('❌ No user account created - THIS IS THE ISSUE!');
    }

    // Check user_roles table
    const [roleCheck] = await connection.execute(
      'SELECT * FROM user_roles WHERE user_id = ?',
      [userCheck.length > 0 ? userCheck[0].id : 0]
    );

    console.log('\n🔍 Checking user_roles entry...');
    if (roleCheck.length > 0) {
      console.log('✅ User role assigned');
      console.log(`   User ID: ${roleCheck[0].user_id}`);
      console.log(`   Role ID: ${roleCheck[0].role_id}`);
    } else {
      console.log('❌ No user role assigned - THIS IS THE ISSUE!');
    }

    // Cleanup
    await connection.execute('DELETE FROM contact_details WHERE student_id = ?', [studentId]);
    await connection.execute('DELETE FROM user_roles WHERE user_id = ?', [userCheck.length > 0 ? userCheck[0].id : 0]);
    await connection.execute('DELETE FROM users WHERE loginID = ?', [testStudent.email]);
    await connection.execute('DELETE FROM students WHERE student_id = ?', [studentId]);

    console.log('\n🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await connection.end();
  }
}

testCurrentStudentAPI();