// Comprehensive Student Creation API Test
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Comprehensive test student data with all possible details
const comprehensiveStudentData = {
  // Basic student information
  first_name: 'John',
  last_name: 'Doe',
  dob: '1995-06-15',
  gender: 'male',
  nationality: 'Indian',
  student_type: 'international',
  status: 'active',
  
  // Contact details
  contact_details: {
    primary_mobile: '+91-9876543210',
    email: 'john.doe@example.com',
    emergency_contact: '+91-9876543211',
    contact_type: 'mobile',
    is_primary: true
  },
  
  // Visa details
  visa_details: {
    visa_type: 'Student Visa',
    visa_number: 'STU123456789',
    start_date: '2024-01-15',
    expiry_date: '2026-01-14',
    status: 'active',
    issuing_country: 'India',
    document_path: '/documents/visa/stu123456789.pdf'
  },
  
  // Addresses (multiple addresses)
  addresses: [
    {
      line1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postal_code: '400001',
      address_type: 'current',
      is_primary: true
    },
    {
      line1: '456 Home Street',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      postal_code: '110001',
      address_type: 'permanent',
      is_primary: false
    }
  ],
  
  // Eligibility status
  eligibility_status: {
    classes_completed: true,
    fees_paid: true,
    assignments_submitted: true,
    documents_submitted: true,
    trainer_consent: true,
    override_requested: false,
    requested_by: null,
    reason: null,
    comments: 'All requirements met',
    overall_status: 'eligible'
  },
  
  // Student lifestyle
  student_lifestyle: {
    currently_working: false,
    working_hours: null,
    has_dependents: false,
    married: false,
    driving_license: true,
    own_vehicle: false,
    public_transport_only: true,
    can_travel_long_distance: true,
    drop_support_available: false,
    fully_flexible: true,
    rush_placement_required: false,
    preferred_days: 'Monday,Tuesday,Wednesday,Thursday,Friday',
    preferred_time_slots: '9:00 AM - 5:00 PM',
    additional_notes: 'Available for any shift timing'
  },
  
  // Placement preferences
  placement_preferences: {
    preferred_states: 'Maharashtra,Karnataka,Tamil Nadu',
    preferred_cities: 'Mumbai,Bangalore,Chennai',
    max_travel_distance_km: 50,
    morning_only: false,
    evening_only: false,
    night_shift: false,
    weekend_only: false,
    part_time: false,
    full_time: true,
    with_friend: true,
    friend_name_or_id: 'Jane Smith',
    with_spouse: false,
    spouse_name_or_id: null,
    earliest_start_date: '2024-03-01',
    latest_start_date: '2024-06-01',
    specific_month_preference: 'March 2024',
    urgency_level: 'within_month',
    additional_preferences: 'Prefer IT companies, good work culture'
  },
  
  // Facility records (multiple records)
  facility_records: [
    {
      facility_name: 'Tech Corp India',
      facility_type: 'IT Company',
      branch_site: 'Mumbai Branch',
      facility_address: '789 Business District, Mumbai',
      contact_person_name: 'HR Manager',
      contact_email: 'hr@techcorp.com',
      contact_phone: '+91-22-12345678',
      supervisor_name: 'Project Manager',
      distance_from_student_km: 15,
      slot_id: 'SLOT001',
      course_type: 'Software Development',
      shift_timing: '9:00 AM - 6:00 PM',
      start_date: '2024-03-01',
      duration_hours: 480,
      gender_requirement: 'Any',
      applied_on: '2024-01-20',
      student_confirmed: true,
      student_comments: 'Interested in this opportunity',
      document_type: 'Application Letter',
      file_path: '/documents/applications/app001.pdf',
      application_status: 'applied'
    }
  ],
  
  // Address change requests (optional)
  address_change_requests: [
    {
      current_address: '123 Main Street, Mumbai',
      new_address: '789 New Street, Mumbai',
      effective_date: '2024-04-01',
      change_reason: 'Relocation for job',
      impact_acknowledged: true
    }
  ],
  
  // Job status updates (multiple records)
  job_status_updates: [
    {
      status: 'actively_applying',
      last_updated_on: '2024-01-25',
      employer_name: null,
      job_role: null,
      start_date: null,
      employment_type: null,
      offer_letter_path: null,
      actively_applying: true,
      expected_timeline: 'Within 3 months',
      searching_comments: 'Actively applying to various IT companies'
    }
  ]
};

async function testStudentCreation() {
  console.log('🧪 Testing Comprehensive Student Creation API');
  console.log('==============================================');
  
  try {
    console.log('📝 Sending comprehensive student data...');
    
    const response = await axios.post(`${API_BASE_URL}/student`, comprehensiveStudentData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Student created successfully!');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Extract student ID for further testing
    const studentId = response.data.data?.student_id;
    if (studentId) {
      console.log(`\n🔍 Student ID: ${studentId}`);
      
      // Test retrieval
      console.log('\n🔍 Testing student retrieval...');
      const getResponse = await axios.get(`${API_BASE_URL}/student/${studentId}`);
      
      console.log('✅ Student retrieved successfully!');
      console.log('📋 Retrieved Data:');
      console.log(JSON.stringify(getResponse.data, null, 2));
      
      // Verify data integrity
      console.log('\n🔍 Verifying data integrity...');
      const retrievedData = getResponse.data.data;
      
      let verificationPassed = true;
      const checks = [
        { name: 'Basic Info', condition: retrievedData.first_name === 'John' && retrievedData.last_name === 'Doe' },
        { name: 'Contact Details', condition: retrievedData.contact_details && retrievedData.contact_details.length > 0 },
        { name: 'Visa Details', condition: retrievedData.visa_details && retrievedData.visa_details.length > 0 },
        { name: 'Addresses', condition: retrievedData.addresses && retrievedData.addresses.length === 2 },
        { name: 'Eligibility Status', condition: retrievedData.eligibility_status && retrievedData.eligibility_status.length > 0 },
        { name: 'Student Lifestyle', condition: retrievedData.student_lifestyle && retrievedData.student_lifestyle.length > 0 },
        { name: 'Placement Preferences', condition: retrievedData.placement_preferences && retrievedData.placement_preferences.length > 0 },
        { name: 'Facility Records', condition: retrievedData.facility_records && retrievedData.facility_records.length > 0 }
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
      } else {
        console.log('\n⚠️  Some data integrity checks FAILED!');
      }
      
      return { success: true, studentId, data: retrievedData };
    }
    
  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    return { success: false, error: error.message };
  }
}

// Export for use as module
module.exports = {
  testStudentCreation,
  comprehensiveStudentData
};

// Run if called directly
if (require.main === module) {
  testStudentCreation().then((result) => {
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