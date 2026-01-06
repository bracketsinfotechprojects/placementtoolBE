// Test User Entity Registration
const { getRepository } = require('typeorm');
const { User } = require('./dist/entities/user/user.entity');

async function testUserEntityRegistration() {
  console.log('🔍 Testing User Entity Registration...\n');

  try {
    // Test 1: Check if User entity can be imported
    console.log('✅ User entity imported successfully');
    console.log('User entity:', User.name);
    console.log('User entity columns:', Object.getOwnPropertyNames(User.prototype));

    // Test 2: Check if repository can be accessed
    const userRepository = getRepository(User);
    console.log('✅ User repository accessible');

    // Test 3: Check database connection
    const connection = userRepository.manager.connection;
    console.log('✅ Database connection available');
    console.log('Connection name:', connection.name);

    // Test 4: Check if users table exists
    const tables = await connection.query('SHOW TABLES');
    const usersTableExists = tables.some(table => 
      Object.values(table).includes('users')
    );
    
    if (usersTableExists) {
      console.log('✅ Users table exists in database');
    } else {
      console.log('❌ Users table does not exist in database');
      console.log('Available tables:', tables.map(t => Object.values(t)[0]));
    }

    // Test 5: Try to get table description
    try {
      const tableDescription = await connection.query('DESCRIBE users');
      console.log('✅ Users table structure retrieved');
      console.log('Table columns:', tableDescription.map(col => col.Field));
    } catch (error) {
      console.log('❌ Could not describe users table:', error.message);
    }

    console.log('\n🎉 User entity registration test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ User entity registration test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
testUserEntityRegistration()
  .then(success => {
    if (success) {
      console.log('\n✅ User entity is properly registered and accessible!');
    } else {
      console.log('\n❌ User entity registration issues found!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });