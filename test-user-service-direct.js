// Test UserService directly to see if it works
const { UserService } = require('./dist/services/user/user.service');

async function testUserServiceDirect() {
  console.log('🧪 Testing UserService directly...\n');

  const testUserData = {
    loginID: 'test.user@example.com',
    password: 'test123',
    userRole: 'student',
    status: 'active'
  };

  try {
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

// Run the test
testUserServiceDirect().then(success => {
  console.log(`\n🏁 UserService test result: ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
});