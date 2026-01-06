// Quick verification script to check user creation fix
const DatabaseManager = require('./dist/database/database.manager');

async function verifyUserCreationFix() {
  console.log('🔍 Verifying User Creation Fix...\n');
  
  const db = new DatabaseManager();
  
  try {
    // Test 1: Check if roles exist
    console.log('📋 Checking roles table...');
    const roles = await db.execute('SELECT * FROM roles WHERE role_name = ?', ['Student']);
    console.log('Student role found:', roles.length > 0);
    
    if (roles.length === 0) {
      console.log('❌ Student role not found in database!');
      return false;
    }
    
    const studentRoleId = roles[0].role_id;
    console.log('Student role ID:', studentRoleId);
    
    // Test 2: Check users table structure
    console.log('\n📋 Checking users table...');
    const users = await db.execute('DESCRIBE users');
    const requiredColumns = ['id', 'loginID', 'password', 'userRole', 'status'];
    const missingColumns = requiredColumns.filter(col => 
      !users.find(u => u.Field === col)
    );
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns in users table:', missingColumns);
      return false;
    }
    
    console.log('✅ Users table structure is correct');
    
    // Test 3: Check user_roles table
    console.log('\n📋 Checking user_roles table...');
    const userRoles = await db.execute('DESCRIBE user_roles');
    const requiredUserRoleColumns = ['user_id', 'role_id'];
    const missingUserRoleColumns = requiredUserRoleColumns.filter(col => 
      !userRoles.find(u => u.Field === col)
    );
    
    if (missingUserRoleColumns.length > 0) {
      console.log('❌ Missing columns in user_roles table:', missingUserRoleColumns);
      return false;
    }
    
    console.log('✅ User_roles table structure is correct');
    
    // Test 4: Check for existing test users
    console.log('\n📋 Checking existing test users...');
    const testUsers = await db.execute(
      'SELECT u.*, r.role_name FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.role_id WHERE u.loginID LIKE "%@example.com"'
    );
    
    console.log(`Found ${testUsers.length} test users`);
    testUsers.forEach(user => {
      console.log(`- ${user.loginID} (Role: ${user.role_name || 'None'})`);
    });
    
    console.log('\n✅ Database verification completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return false;
  }
}

// Run verification
verifyUserCreationFix()
  .then(success => {
    if (success) {
      console.log('\n🎉 User creation fix verification PASSED!');
      console.log('The database schema is ready for the user creation fix.');
    } else {
      console.log('\n❌ User creation fix verification FAILED!');
      console.log('Please check the database schema and try again.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Verification script failed:', error);
    process.exit(1);
  });