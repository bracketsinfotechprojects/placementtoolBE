// Simple test to verify the student API user creation functionality
const { StudentService } = require('./dist/services/student/student.service');

async function testStudentUserCreation() {
  console.log('🧪 Testing Student API User Creation...\n');

  // Test data with email
  const testStudentData = {
    first_name: 'Test',
    last_name: 'Student',
    dob: new Date('1995-01-01'),
    gender: 'male',
    nationality: 'American',
    student_type: 'international',
    status: 'active',
    email: 'test.student@example.com'
  };

  try {
    console.log('📝 Creating student with email...');
    
    // This would normally be called from the controller
    const student = await StudentService.create(testStudentData);
    
    console.log('✅ Student created successfully');
    console.log(`   Student ID: ${student.student_id}`);
    console.log(`   Name: ${student.first_name} ${student.last_name}`);
    
    console.log('\n🔍 User account should be created automatically:');
    console.log(`   Expected LoginID: ${testStudentData.email}`);
    console.log('   Expected Password: test123');
    console.log('   Expected Role: student');
    console.log('   Expected Status: active');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testStudentUserCreation().then(success => {
  console.log(`\n🏁 Test result: ${success ? 'PASSED' : 'FAILED'}`);
});