// Test to verify roles are seeded properly
const DatabaseManager = require('./dist/database/database.manager');

async function testRolesSeeding() {
  console.log('🔍 Testing roles seeding...\n');
  
  const db = new DatabaseManager();
  
  try {
    // Check if roles table exists and has data
    console.log('📋 Checking roles table...');
    const roles = await db.execute('SELECT * FROM roles ORDER BY role_id');
    
    if (roles.length === 0) {
      console.log('❌ No roles found in database! Roles might not be seeded.');
      console.log('💡 Run the migration to seed default roles.');
      return false;
    }
    
    console.log(`✅ Found ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`   ${role.role_id}: ${role.role_name}`);
    });
    
    // Check specifically for Student role
    const studentRole = roles.find(r => r.role_name === 'Student');
    if (studentRole) {
      console.log(`✅ Student role found with ID: ${studentRole.role_id}`);
    } else {
      console.log('❌ Student role not found!');
      console.log('Available roles:', roles.map(r => r.role_name));
      return false;
    }
    
    // Check if users table exists
    console.log('\n📋 Checking users table...');
    const users = await db.execute('DESCRIBE users');
    const hasRoleID = users.find(u => u.Field === 'roleID');
    
    if (hasRoleID) {
      console.log('✅ users table has roleID column');
    } else {
      console.log('❌ users table missing roleID column');
      return false;
    }
    
    console.log('\n🎉 Roles and schema verification completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Roles seeding test failed:', error.message);
    return false;
  }
}

// Run the test
testRolesSeeding()
  .then(success => {
    if (success) {
      console.log('\n✅ Database schema and roles are properly configured!');
    } else {
      console.log('\n❌ Issues found with database schema or roles!');
      console.log('💡 Make sure to run the migration to create tables and seed roles.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });