const mysql = require('mysql2/promise');
const axios = require('axios');

async function testStudentUserCreation() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_db'
  });

  try {
    console.log('🧪 Testing Student API with automatic user creation...\n');

    // Check current data
    console.log('📊 Current data counts:');
    const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log(`Students: ${students[0].count}`);

    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`Users: ${users[0].count}`);

    // Test student creation via API
    const testStudent = {
      first_name: 'John',
      last_name: 'Doe',
      dob: '1995-05-15',
      gender: 'male',
      nationality: 'American',
      student_type: 'international',
      status: 'active',
      contact_details: {
        primary_mobile: '+1234567890',
        email: 'john.doe@example.com',
        emergency_contact: '+0987654321',
        contact_type: 'mobile',
        is_primary: true
      },
      visa_details: {
        visa_type: 'F1',
        visa_number: 'V123456789',
        start_date: '2024-01-01',
        expiry_date: '2026-01-01',
        status: 'active',
        issuing_country: 'USA'
      },
      addresses: [{
        line1: '123 University Ave',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        postal_code: '02115',
        address_type: 'current',
        is_primary: true
      }]
    };

    console.log('\n📝 Creating student via API...');
    
    // Make API request to create student
    try {
      const response = await axios.post('http://localhost:3000/api/students', testStudent, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Student created successfully via API');
      console.log(`   Student ID: ${response.data.data.student_id}`);
      console.log(`   Name: ${response.data.data.first_name} ${response.data.data.last_name}`);

      // Check if user was automatically created
      console.log('\n🔍 Checking for automatic user creation...');
      const [userCheck] = await connection.execute(
        'SELECT * FROM users WHERE loginID = ?',
        [testStudent.contact_details.email]
      );

      if (userCheck.length > 0) {
        const user = userCheck[0];
        console.log('✅ User account created automatically!');
        console.log(`   User ID: ${user.id}`);
        console.log(`   LoginID: ${user.loginID}`);
        console.log(`   Password: ${user.password} (should be 'test123')`);
        console.log(`   UserRole: ${user.userRole} (should be 'student')`);
        console.log(`   Status: ${user.status} (should be 'active')`);

        // Verify the credentials match requirements
        const loginIDCorrect = user.loginID === testStudent.contact_details.email;
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

        // Cleanup: Delete the created records
        console.log('\n🧹 Cleaning up test data...');
        
        // Delete user first (due to foreign key constraints)
        await connection.execute('DELETE FROM users WHERE loginID = ?', [testStudent.contact_details.email]);
        console.log('   User deleted');

        // Delete student and related data
        await connection.execute('DELETE FROM contact_details WHERE student_id = ?', [response.data.data.student_id]);
        await connection.execute('DELETE FROM addresses WHERE student_id = ?', [response.data.data.student_id]);
        await connection.execute('DELETE FROM visa_details WHERE student_id = ?', [response.data.data.student_id]);
        await connection.execute('DELETE FROM students WHERE student_id = ?', [response.data.data.student_id]);
        console.log('   Student and related data deleted');

        console.log('✅ Test completed successfully!');
        return allRequirementsMet;

      } else {
        console.log('❌ No user account created automatically');
        console.log('   This indicates the student creation API is not creating user accounts');
        
        // Cleanup student data
        await connection.execute('DELETE FROM contact_details WHERE student_id = ?', [response.data.data.student_id]);
        await connection.execute('DELETE FROM addresses WHERE student_id = ?', [response.data.data.student_id]);
        await connection.execute('DELETE FROM visa_details WHERE student_id = ?', [response.data.data.student_id]);
        await connection.execute('DELETE FROM students WHERE student_id = ?', [response.data.data.student_id]);
        
        return false;
      }

    } catch (apiError) {
      console.log('❌ API request failed:', apiError.message);
      
      // Check if it's a connection issue or application issue
      if (apiError.code === 'ECONNREFUSED') {
        console.log('   💡 Make sure the API server is running on port 3000');
        console.log('   💡 Start it with: npm run dev or npm start');
      } else if (apiError.response) {
        console.log(`   HTTP ${apiError.response.status}: ${JSON.stringify(apiError.response.data, null, 2)}`);
      }
      
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
testStudentUserCreation().then(success => {
  console.log(`\n🏁 Test result: ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
});