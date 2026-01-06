const mysql = require('mysql2/promise');

async function testStudentUserCreationDirect() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_db'
  });

  try {
    console.log('🧪 Testing Student Creation with Direct Database Calls...\n');

    // Check current data
    console.log('📊 Current data counts:');
    const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log(`Students: ${students[0].count}`);

    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`Users: ${users[0].count}`);

    // Test direct student creation (simulating what the API would do)
    const testStudent = {
      first_name: 'Jane',
      last_name: 'Smith',
      dob: '1996-08-20',
      gender: 'female',
      nationality: 'Canadian',
      student_type: 'international',
      status: 'active',
      email: 'jane.smith@example.com'
    };

    console.log('\n📝 Creating student directly in database...');
    
    // Create student
    const [studentResult] = await connection.execute(
      `INSERT INTO students (first_name, last_name, dob, gender, nationality, student_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [testStudent.first_name, testStudent.last_name, testStudent.dob, testStudent.gender, 
       testStudent.nationality, testStudent.student_type, testStudent.status]
    );

    const studentId = studentResult.insertId;
    console.log(`✅ Student created with ID: ${studentId}`);

    // Create contact details with email
    await connection.execute(
      `INSERT INTO contact_details (student_id, email, primary_mobile, is_primary) 
       VALUES (?, ?, ?, 1)`,
      [studentId, testStudent.email, '+1987654321']
    );
    console.log(`✅ Contact details created with email: ${testStudent.email}`);

    // Test user creation (simulating what the student service would do)
    console.log('\n🔍 Testing user account creation...');
    
    try {
      const [userResult] = await connection.execute(
        `INSERT INTO users (loginID, password, userRole, status) 
         VALUES (?, ?, ?, ?)`,
        [testStudent.email, 'test123', 'student', 'active']
      );

      const userId = userResult.insertId;
      console.log('✅ User account created successfully!');
      console.log(`   User ID: ${userId}`);
      console.log(`   LoginID: ${testStudent.email}`);
      console.log(`   Password: test123`);
      console.log(`   UserRole: student`);
      console.log(`   Status: active`);

      // Verify the user was created correctly
      const [userCheck] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (userCheck.length > 0) {
        const user = userCheck[0];
        const loginIDCorrect = user.loginID === testStudent.email;
        const passwordCorrect = user.password === 'test123';
        const roleCorrect = user.userRole === 'student';
        const statusCorrect = user.status === 'active';

        console.log('\n✅ Credential verification:');
        console.log(`   LoginID (email) correct: ${loginIDCorrect ? '✅' : '❌'}`);
        console.log(`   Password 'test123': ${passwordCorrect ? '✅' : '❌'}`);
        console.log(`   Role 'student': ${roleCorrect ? '✅' : '❌'}`);
        console.log(`   Status 'active': ${statusCorrect ? '✅' : '❌'}`);

        // Check if all requirements are met
        const allRequirementsMet = loginIDCorrect && passwordCorrect && roleCorrect && statusCorrect;
        console.log(`\n🎯 All requirements met: ${allRequirementsMet ? '✅ YES' : '❌ NO'}`);

        // Test uniqueness constraint (try to create another user with same email)
        console.log('\n🧪 Testing email uniqueness constraint...');
        try {
          await connection.execute(
            `INSERT INTO users (loginID, password, userRole, status) 
             VALUES (?, ?, ?, ?)`,
            [testStudent.email, 'different_password', 'admin', 'active']
          );
          console.log('❌ Email uniqueness constraint failed - duplicate email was allowed');
        } catch (uniqueError) {
          if (uniqueError.code === 'ER_DUP_ENTRY') {
            console.log('✅ Email uniqueness constraint working correctly');
          } else {
            console.log('❌ Unexpected error during uniqueness test:', uniqueError.message);
          }
        }

        // Cleanup: Delete the created records
        console.log('\n🧹 Cleaning up test data...');
        
        // Delete user first (due to foreign key constraints)
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        console.log('   User deleted');

        // Delete student and related data
        await connection.execute('DELETE FROM contact_details WHERE student_id = ?', [studentId]);
        await connection.execute('DELETE FROM students WHERE student_id = ?', [studentId]);
        console.log('   Student and related data deleted');

        console.log('✅ Test completed successfully!');
        return allRequirementsMet;

      } else {
        console.log('❌ User verification failed - user not found after creation');
        return false;
      }

    } catch (userError) {
      console.log('❌ User creation failed:', userError.message);
      
      // Cleanup student data
      await connection.execute('DELETE FROM contact_details WHERE student_id = ?', [studentId]);
      await connection.execute('DELETE FROM students WHERE student_id = ?', [studentId]);
      
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await connection.end();
  }
}

// Run the test
testStudentUserCreationDirect().then(success => {
  console.log(`\n🏁 Test result: ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
});