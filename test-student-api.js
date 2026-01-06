const http = require('http');

// Test data
const studentData = {
  first_name: "Ananya",
  last_name: "Singh",
  dob: "1999-12-10",
  gender: "Female",
  nationality: "Indian",
  student_type: "Full-time",
  contact_details: {
    primary_mobile: "8765432109",
    email: "ananya.singh@newdomain.com",
    emergency_contact: "9988776655"
  },
  visa_details: {
    visa_type: "Student Visa",
    visa_number: "STU654321",
    start_date: "2024-01-01",
    expiry_date: "2026-01-01"
  },
  addresses: [{
    line1: "789 Residency",
    city: "Thane",
    state: "Maharashtra",
    country: "India",
    postal_code: "400606"
  }],
  eligibility_status: {
    classes_completed: true,
    fees_paid: true,
    assignments_submitted: true,
    documents_submitted: true,
    trainer_consent: true,
    override_requested: false,
    requested_by: null,
    reason: null,
    comments: null
  },
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
    preferred_days: "Mon-Fri",
    preferred_time_slots: "Morning"
  },
  placement_preferences: {
    preferred_states: "Maharashtra",
    preferred_cities: "Mumbai,Pune",
    max_travel_distance_km: 30,
    morning_only: true,
    evening_only: false,
    night_shift: false,
    weekend_only: false,
    part_time: false,
    full_time: true,
    with_friend: false,
    friend_name_or_id: null,
    with_spouse: false,
    spouse_name_or_id: null,
    earliest_start_date: "2026-02-01",
    latest_start_date: "2026-03-01",
    specific_month_preference: "February"
  },
  facility_records: [{
    facility_name: "Tech Training Center",
    facility_type: "IT",
    branch_site: "Andheri",
    facility_address: "456 Tech Park, Mumbai",
    contact_person_name: "Anita Mehta",
    contact_email: "anita.mehta@facility.com",
    contact_phone: "9988776655",
    supervisor_name: "Suresh Patil",
    distance_from_student_km: 12,
    slot_id: "SLOT101",
    course_type: "Java Fullstack",
    shift_timing: "Morning",
    start_date: "2026-02-10",
    duration_hours: 120,
    gender_requirement: "Any",
    applied_on: "2026-01-15",
    student_confirmed: true,
    student_comments: "Looking forward to training",
    document_type: "Offer Letter",
    file_path: "/docs/offer_letter.pdf"
  }],
  address_change_requests: [{
    current_address: "123 MG Road, Mumbai",
    new_address: "789 Residency, Thane",
    effective_date: "2026-02-01",
    change_reason: "Closer to facility",
    impact_acknowledged: true
  }],
  job_status_updates: [{
    status: "Placed",
    last_updated_on: "2026-03-01",
    employer_name: "Infosys",
    job_role: "Software Engineer",
    start_date: "2026-03-15",
    employment_type: "Full-time",
    offer_letter_path: "/docs/infosys_offer.pdf",
    actively_applying: false,
    expected_timeline: "Immediate",
    searching_comments: "Excited to join"
  }]
};

console.log('Testing Student API...');
console.log('Making POST request to create new student...');

// Make POST request
const postData = JSON.stringify(studentData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/student',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('\n🎉 Student created successfully with ID:', response.data?.student_id);
        
        // Now test GET request
        setTimeout(() => {
          testGetStudent(response.data?.student_id);
        }, 1000);
      } else {
        console.log('❌ Error:', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.log('❌ Parse error:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request error:', error.message);
});

req.write(postData);
req.end();

// Test GET request for specific student
function testGetStudent(studentId) {
  if (!studentId) {
    console.log('❌ No student ID to test GET request');
    return;
  }

  console.log('\nTesting GET request for student ID:', studentId);

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/student/${studentId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ GET Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('\n🎉 Student retrieved successfully!');
          console.log('Student Name:', response.data?.first_name, response.data?.last_name);
          console.log('Email:', response.data?.contact_details?.email);
          console.log('Phone:', response.data?.contact_details?.primary_mobile);
        } else {
          console.log('❌ GET Error:', JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.log('❌ GET Parse error:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ GET Request error:', error.message);
  });

  req.end();
}