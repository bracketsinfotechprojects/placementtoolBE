// Direct MySQL test for comprehensive student creation
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Atul@2626',
  database: process.env.DB_NAME || 'testCRM'
};

async function testComprehensiveStudentCreation() {
  console.log('🧪 Testing Comprehensive Student Creation (Direct MySQL)');
  console.log('========================================================');
  
  let connection;
  let studentId;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Test data
    const studentData = {
      first_name: 'John',
      last_name: 'Doe',
      dob: '1995-06-15',
      gender: 'male',
      nationality: 'Indian',
      student_type: 'international',
      status: 'active'
    };
    
    console.log('\n📝 Step 1: Creating student record...');
    const [studentResult] = await connection.execute(`
      INSERT INTO students (first_name, last_name, dob, gender, nationality, student_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      studentData.first_name,
      studentData.last_name,
      studentData.dob,
      studentData.gender,
      studentData.nationality,
      studentData.student_type,
      studentData.status
    ]);
    
    studentId = studentResult.insertId;
    console.log(`✅ Student created with ID: ${studentId}`);
    
    console.log('\n📝 Step 2: Creating contact details...');
    await connection.execute(`
      INSERT INTO contact_details (student_id, primary_mobile, email, emergency_contact, contact_type, is_primary)
      VALUES (?, ?, ?, ?, 'mobile', 1)
    `, [
      studentId,
      '+91-9876543210',
      'john.doe@example.com',
      '+91-9876543211'
    ]);
    console.log('✅ Contact details created');
    
    console.log('\n📝 Step 3: Creating visa details...');
    await connection.execute(`
      INSERT INTO visa_details (student_id, visa_type, visa_number, start_date, expiry_date, status, issuing_country)
      VALUES (?, 'Student Visa', 'STU123456789', '2024-01-15', '2026-01-14', 'active', 'India')
    `, [studentId]);
    console.log('✅ Visa details created');
    
    console.log('\n📝 Step 4: Creating addresses...');
    // Current address
    await connection.execute(`
      INSERT INTO addresses (student_id, line1, city, state, country, postal_code, address_type, is_primary)
      VALUES (?, '123 Main Street', 'Mumbai', 'Maharashtra', 'India', '400001', 'current', 1)
    `, [studentId]);
    
    // Permanent address
    await connection.execute(`
      INSERT INTO addresses (student_id, line1, city, state, country, postal_code, address_type, is_primary)
      VALUES (?, '456 Home Street', 'Delhi', 'Delhi', 'India', '110001', 'permanent', 0)
    `, [studentId]);
    console.log('✅ Addresses created (2 addresses)');
    
    console.log('\n📝 Step 5: Creating eligibility status...');
    await connection.execute(`
      INSERT INTO eligibility_status (student_id, classes_completed, fees_paid, assignments_submitted, documents_submitted, trainer_consent, overall_status, comments)
      VALUES (?, 1, 1, 1, 1, 1, 'eligible', 'All requirements met')
    `, [studentId]);
    console.log('✅ Eligibility status created');
    
    console.log('\n📝 Step 6: Creating student lifestyle...');
    await connection.execute(`
      INSERT INTO student_lifestyle (
        student_id, currently_working, has_dependents, married, 
        driving_license, own_vehicle, public_transport_only, 
        can_travel_long_distance, drop_support_available, fully_flexible,
        preferred_days, preferred_time_slots, additional_notes
      ) VALUES (?, 0, 0, 0, 1, 0, 1, 1, 0, 1, 'Monday,Tuesday,Wednesday,Thursday,Friday', '9:00 AM - 5:00 PM', 'Available for any shift timing')
    `, [studentId]);
    console.log('✅ Student lifestyle created');
    
    console.log('\n📝 Step 7: Creating placement preferences...');
    await connection.execute(`
      INSERT INTO placement_preferences (
        student_id, preferred_states, preferred_cities, max_travel_distance_km,
        full_time, with_friend, friend_name_or_id, earliest_start_date,
        latest_start_date, urgency_level, additional_preferences
      ) VALUES (?, 'Maharashtra,Karnataka,Tamil Nadu', 'Mumbai,Bangalore,Chennai', 50, 1, 1, 'Jane Smith', '2024-03-01', '2024-06-01', 'within_month', 'Prefer IT companies, good work culture')
    `, [studentId]);
    console.log('✅ Placement preferences created');
    
    console.log('\n📝 Step 8: Creating facility records...');
    await connection.execute(`
      INSERT INTO facility_records (
        student_id, facility_name, facility_type, branch_site, facility_address,
        contact_person_name, contact_email, contact_phone, supervisor_name,
        distance_from_student_km, slot_id, course_type, shift_timing,
        start_date, duration_hours, applied_on, student_confirmed,
        student_comments, application_status
      ) VALUES (?, 'Tech Corp India', 'IT Company', 'Mumbai Branch', '789 Business District, Mumbai',
        'HR Manager', 'hr@techcorp.com', '+91-22-12345678', 'Project Manager',
        15, 'SLOT001', 'Software Development', '9:00 AM - 6:00 PM',
        '2024-03-01', 480, '2024-01-20', 1,
        'Interested in this opportunity', 'applied')
    `, [studentId]);
    console.log('✅ Facility records created');
    
    console.log('\n📝 Step 9: Creating address change request...');
    await connection.execute(`
      INSERT INTO address_change_requests (
        student_id, current_address, new_address, effective_date,
        change_reason, impact_acknowledged, status
      ) VALUES (?, '123 Old Street, Mumbai', '456 New Street, Mumbai', '2024-04-01',
        'Relocation for job', 1, 'pending')
    `, [studentId]);
    console.log('✅ Address change request created');
    
    console.log('\n📝 Step 10: Creating job status updates...');
    await connection.execute(`
      INSERT INTO job_status_updates (
        student_id, status, last_updated_on, actively_applying,
        expected_timeline, searching_comments
      ) VALUES (?, 'actively_applying', CURDATE(), 1, 'Within 3 months', 'Actively applying to various IT companies')
    `, [studentId]);
    console.log('✅ Job status updates created');
    
    // Now retrieve and verify all data
    console.log('\n🔍 Step 11: Retrieving and verifying all data...');
    
    // Get student basic info
    const [studentBasic] = await connection.execute(`
      SELECT * FROM students WHERE student_id = ?
    `, [studentId]);
    
    // Get related data separately
    const [contactDetails] = await connection.execute(`
      SELECT * FROM contact_details WHERE student_id = ?
    `, [studentId]);
    
    const [visaDetails] = await connection.execute(`
      SELECT * FROM visa_details WHERE student_id = ?
    `, [studentId]);
    
    const [addresses] = await connection.execute(`
      SELECT * FROM addresses WHERE student_id = ?
    `, [studentId]);
    
    const [eligibilityStatus] = await connection.execute(`
      SELECT * FROM eligibility_status WHERE student_id = ?
    `, [studentId]);
    
    const [studentLifestyle] = await connection.execute(`
      SELECT * FROM student_lifestyle WHERE student_id = ?
    `, [studentId]);
    
    const [placementPreferences] = await connection.execute(`
      SELECT * FROM placement_preferences WHERE student_id = ?
    `, [studentId]);
    
    const [facilityRecords] = await connection.execute(`
      SELECT * FROM facility_records WHERE student_id = ?
    `, [studentId]);
    
    const [addressChangeRequests] = await connection.execute(`
      SELECT * FROM address_change_requests WHERE student_id = ?
    `, [studentId]);
    
    const [jobStatusUpdates] = await connection.execute(`
      SELECT * FROM job_status_updates WHERE student_id = ?
    `, [studentId]);
    
    // Combine all data
    const student = {
      ...studentBasic[0],
      contact_details: contactDetails,
      visa_details: visaDetails,
      addresses: addresses,
      eligibility_status: eligibilityStatus,
      student_lifestyle: studentLifestyle,
      placement_preferences: placementPreferences,
      facility_records: facilityRecords,
      address_change_requests: addressChangeRequests,
      job_status_updates: jobStatusUpdates
    };
    
    if (studentBasic.length > 0) {
      console.log('\n📋 Complete Student Record:');
      console.log('=====================================');
      console.log(`Student ID: ${student.student_id}`);
      console.log(`Name: ${student.first_name} ${student.last_name}`);
      console.log(`DOB: ${student.dob}`);
      console.log(`Gender: ${student.gender}`);
      console.log(`Nationality: ${student.nationality}`);
      console.log(`Student Type: ${student.student_type}`);
      console.log(`Status: ${student.status}`);
      console.log(`Contact Info: ${student.contact_info || 'None'}`);
      console.log(`Visa Info: ${student.visa_info || 'None'}`);
      console.log(`Addresses: ${student.addresses || 'None'}`);
      console.log(`Eligibility Status: ${student.eligibility_status || 'None'}`);
      console.log(`Preferred Days: ${student.preferred_days || 'None'}`);
      console.log(`Preferred States: ${student.preferred_states || 'None'}`);
      console.log(`Urgency Level: ${student.urgency_level || 'None'}`);
      console.log(`Facility: ${student.facility_name || 'None'} (${student.application_status || 'None'})`);
      console.log(`Address Change Status: ${student.address_change_status || 'None'}`);
      console.log(`Job Status: ${student.job_status || 'None'}`);
      
      console.log('\n✅ SUCCESS: Comprehensive student record created and retrieved!');
      
      // Verify all related data exists
      console.log('\n🔍 Data Verification:');
      const verificationChecks = [
        { name: 'Student Record', sql: 'SELECT COUNT(*) as count FROM students WHERE student_id = ?', param: [studentId] },
        { name: 'Contact Details', sql: 'SELECT COUNT(*) as count FROM contact_details WHERE student_id = ?', param: [studentId] },
        { name: 'Visa Details', sql: 'SELECT COUNT(*) as count FROM visa_details WHERE student_id = ?', param: [studentId] },
        { name: 'Addresses', sql: 'SELECT COUNT(*) as count FROM addresses WHERE student_id = ?', param: [studentId] },
        { name: 'Eligibility Status', sql: 'SELECT COUNT(*) as count FROM eligibility_status WHERE student_id = ?', param: [studentId] },
        { name: 'Student Lifestyle', sql: 'SELECT COUNT(*) as count FROM student_lifestyle WHERE student_id = ?', param: [studentId] },
        { name: 'Placement Preferences', sql: 'SELECT COUNT(*) as count FROM placement_preferences WHERE student_id = ?', param: [studentId] },
        { name: 'Facility Records', sql: 'SELECT COUNT(*) as count FROM facility_records WHERE student_id = ?', param: [studentId] },
        { name: 'Address Change Requests', sql: 'SELECT COUNT(*) as count FROM address_change_requests WHERE student_id = ?', param: [studentId] },
        { name: 'Job Status Updates', sql: 'SELECT COUNT(*) as count FROM job_status_updates WHERE student_id = ?', param: [studentId] }
      ];
      
      let allPassed = true;
      for (const check of verificationChecks) {
        const [result] = await connection.execute(check.sql, check.param);
        const count = result[0].count;
        if (count > 0) {
          console.log(`✅ ${check.name}: ${count} record(s) found`);
        } else {
          console.log(`❌ ${check.name}: No records found`);
          allPassed = false;
        }
      }
      
      if (allPassed) {
        console.log('\n🎉 ALL DATA VERIFICATION CHECKS PASSED!');
        console.log('✅ Student creation functionality is working correctly!');
      } else {
        console.log('\n⚠️  Some verification checks failed!');
      }
      
      return { success: true, studentId, data: student };
    } else {
      throw new Error('Student not found after creation');
    }
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error(error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  testComprehensiveStudentCreation().then((result) => {
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

module.exports = { testComprehensiveStudentCreation };