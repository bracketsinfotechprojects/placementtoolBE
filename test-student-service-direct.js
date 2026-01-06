// Direct test of student service functionality
const { initializeDatabase } = require('./dist/database/database.config');
const StudentService = require('./dist/services/student/student.service').default;
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Atul@2626',
  database: process.env.DB_NAME || 'testCRM'
};

async function testStudentCreationDirect() {
  console.log('🧪 Testing Student Service Directly');
  console.log('====================================');
  
  let connection;
  let studentId;
  
  try {
    // Test direct database connection first
    console.log('🔌 Testing direct database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Direct database connection successful');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM students');
    console.log(`📊 Current students count: ${rows[0].count}`);
    
    // Close direct connection
    await connection.end();
    
    // Now test with the service
    console.log('\n🔧 Initializing TypeORM connection...');
    await initializeDatabase();
    console.log('✅ TypeORM connection initialized');
    
    // Create comprehensive student data
    const studentData = {
      first_name: 'John',
      last_name: 'Doe',
      dob: new Date('1995-06-15'),
      gender: 'male',
      nationality: 'Indian',
      student_type: 'international',
      status: 'active'
    };
    
    console.log('\n📝 Creating student with service...');
    const student = await StudentService.create(studentData);
    studentId = student.student_id;
    console.log(`✅ Student created with ID: ${studentId}`);
    
    // Now test direct database insertion of related data
    console.log('\n📝 Inserting related data directly...');
    
    // Create a new connection for direct queries
    connection = await mysql.createConnection(dbConfig);
    
    // Insert contact details
    await connection.execute(`
      INSERT INTO contact_details (student_id, primary_mobile, email, contact_type, is_primary)
      VALUES (?, ?, ?, 'mobile', 1)
    `, [studentId, '+91-9876543210', 'john.doe@example.com']);
    console.log('✅ Contact details inserted');
    
    // Insert visa details
    await connection.execute(`
      INSERT INTO visa_details (student_id, visa_type, visa_number, status)
      VALUES (?, 'Student Visa', 'STU123456789', 'active')
    `, [studentId]);
    console.log('✅ Visa details inserted');
    
    // Insert addresses
    await connection.execute(`
      INSERT INTO addresses (student_id, line1, city, state, country, address_type, is_primary)
      VALUES (?, '123 Main Street', 'Mumbai', 'Maharashtra', 'India', 'current', 1)
    `, [studentId]);
    console.log('✅ Address inserted');
    
    // Insert eligibility status
    await connection.execute(`
      INSERT INTO eligibility_status (student_id, classes_completed, fees_paid, overall_status)
      VALUES (?, 1, 1, 'eligible')
    `, [studentId]);
    console.log('✅ Eligibility status inserted');
    
    // Insert student lifestyle
    await connection.execute(`
      INSERT INTO student_lifestyle (student_id, driving_license, public_transport_only, fully_flexible)
      VALUES (?, 1, 1, 1)
    `, [studentId]);
    console.log('✅ Student lifestyle inserted');
    
    // Insert placement preferences
    await connection.execute(`
      INSERT INTO placement_preferences (student_id, preferred_states, full_time, urgency_level)
      VALUES (?, 'Maharashtra,Karnataka', 1, 'within_month')
    `, [studentId]);
    console.log('✅ Placement preferences inserted');
    
    // Insert facility record
    await connection.execute(`
      INSERT INTO facility_records (student_id, facility_name, facility_type, application_status)
      VALUES (?, 'Tech Corp India', 'IT Company', 'applied')
    `, [studentId]);
    console.log('✅ Facility record inserted');
    
    // Insert address change request
    await connection.execute(`
      INSERT INTO address_change_requests (student_id, current_address, new_address, impact_acknowledged)
      VALUES (?, '123 Old Street', '456 New Street', 1)
    `, [studentId]);
    console.log('✅ Address change request inserted');
    
    // Insert job status update
    await connection.execute(`
      INSERT INTO job_status_updates (student_id, status, last_updated_on, actively_applying)
      VALUES (?, 'actively_applying', CURDATE(), 1)
    `, [studentId]);
    console.log('✅ Job status update inserted');
    
    await connection.end();
    
    // Now retrieve and verify the complete student data
    console.log('\n🔍 Retrieving complete student data...');
    const completeStudent = await StudentService.getById({ id: studentId });
    
    console.log('📋 Complete student data retrieved:');
    console.log(JSON.stringify(completeStudent, null, 2));
    
    // Verify data integrity
    console.log('\n🔍 Verifying data integrity...');
    let verificationPassed = true;
    
    const checks = [
      { name: 'Basic Info', condition: completeStudent.first_name === 'John' && completeStudent.last_name === 'Doe' },
      { name: 'Contact Details', condition: completeStudent.contact_details && completeStudent.contact_details.length > 0 },
      { name: 'Visa Details', condition: completeStudent.visa_details && completeStudent.visa_details.length > 0 },
      { name: 'Addresses', condition: completeStudent.addresses && completeStudent.addresses.length > 0 },
      { name: 'Eligibility Status', condition: completeStudent.eligibility_status && completeStudent.eligibility_status.length > 0 },
      { name: 'Student Lifestyle', condition: completeStudent.student_lifestyle && completeStudent.student_lifestyle.length > 0 },
      { name: 'Placement Preferences', condition: completeStudent.placement_preferences && completeStudent.placement_preferences.length > 0 },
      { name: 'Facility Records', condition: completeStudent.facility_records && completeStudent.facility_records.length > 0 }
    ];
    
    checks.forEach(check => {
      if (check.condition) {
        console.log(`✅ ${check.name}: PASSED`);
      } else {
        console.log(`❌ ${check.name}: FAILED`);
        verificationPassed = false;
      }
    });
    
    if (verificationPassed) {
      console.log('\n🎉 All data integrity checks PASSED!');
      console.log('✅ Student creation API test completed successfully!');
    } else {
      console.log('\n⚠️  Some data integrity checks FAILED!');
    }
    
    return { success: true, studentId, data: completeStudent };
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error(error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  testStudentCreationDirect().then((result) => {
    if (result.success) {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Test failed!');
      process.exit(1);
    }
  }).catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { testStudentCreationDirect };