// Comprehensive Test for Student User Creation Fix
const axios = require('axios');

const BASE_URL = 'http://localhost:5555';

async function testStudentUserCreation() {
  console.log('🧪 Testing Student User Creation with Role Assignment...\n');

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
      email: 'john.doe.test@example.com',
      emergency_contact: '+0987654321',
      contact_type: 'mobile',
      is_primary: true
    }
  };

  try {
    console.log('📝 Creating test student with email:', testStudent.contact_details.email);
    console.log('Student data:', JSON.stringify(testStudent, null, 2));
    console.log();

    // Create student via API
    const response = await axios.post(`${BASE_URL}/student`, testStudent, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Student created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log();

    // Now test if user was created by trying to authenticate
    console.log('🔐 Testing user authentication...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/auth/login`, {
        username: testStudent.contact_details.email,
        password: 'test123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ User authentication successful!');
      console.log('Auth response:', JSON.stringify(authResponse.data, null, 2));

      return {
        success: true,
        student: response.data,
        authentication: authResponse.data
      };

    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('❌ User authentication failed - credentials may be incorrect');
      } else {
        console.log('❌ User authentication failed:', authError.message);
      }
      
      return {
        success: true, // Student creation worked
        student: response.data,
        authentication: {
          success: false,
          error: authError.message
        }
      };
    }

  } catch (error) {
    console.error('❌ Student creation failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Server may not be running.');
      console.error('Make sure the server is running on:', BASE_URL);
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response ? error.response.data : null
    };
  }
}

async function testUserServiceDirect() {
  console.log('\n🔧 Testing UserService directly...');
  
  try {
    // Import the built UserService (after build completes)
    const { UserService } = require('./dist/services/user/user.service');
    
    const testUserData = {
      loginID: 'direct.test@example.com',
      password: 'test123',
      userRole: 'Student',
      status: 'active'
    };

    console.log('📝 Creating user directly with UserService...');
    console.log('User data:', testUserData);
    
    const user = await UserService.create(testUserData);
    
    console.log('✅ User created successfully!');
    console.log('User result:', user);
    
    // Verify user was created
    const foundUser = await UserService.getById({ id: user.id });
    console.log('✅ User retrieved successfully!');
    console.log('Found user:', foundUser);
    
    return true;
    
  } catch (error) {
    console.error('❌ UserService test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive Student User Creation Tests...\n');
  
  // Test 1: Direct UserService test
  const userServiceTest = await testUserServiceDirect();
  
  // Test 2: Full API test
  const apiTest = await testStudentUserCreation();
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`UserService Direct Test: ${userServiceTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Student API Test: ${apiTest.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (apiTest.authentication && apiTest.authentication.success) {
    console.log('🎉 Full user creation and authentication working!');
  } else if (apiTest.success) {
    console.log('⚠️ Student created but user authentication failed - check user creation logic');
  } else {
    console.log('❌ Student creation failed - check server and database');
  }
  
  console.log('\n🏁 Tests completed!');
  
  // Exit with appropriate code
  process.exit(userServiceTest && apiTest.success ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});