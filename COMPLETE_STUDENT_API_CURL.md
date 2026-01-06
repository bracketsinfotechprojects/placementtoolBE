# Complete Student API Curl Command with ALL Fields

Here's the complete curl command with ALL possible fields including placement preferences, facility records, address change requests, and job status updates:

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "dob": "1996-08-20",
    "gender": "female",
    "nationality": "Canadian",
    "student_type": "international",
    "status": "active",
    "contact_details": {
      "primary_mobile": "+1987654321",
      "email": "jane.smith@example.com",
      "emergency_contact": "+1122334455",
      "contact_type": "mobile",
      "is_primary": true
    },
    "visa_details": {
      "visa_type": "F1",
      "visa_number": "V123456789",
      "start_date": "2024-01-01",
      "expiry_date": "2026-01-01",
      "status": "active",
      "issuing_country": "USA"
    },
    "addresses": [
      {
        "line1": "123 University Ave",
        "city": "Boston",
        "state": "MA",
        "country": "USA",
        "postal_code": "02115",
        "address_type": "current",
        "is_primary": true
      },
      {
        "line1": "456 Home Street",
        "city": "Toronto",
        "state": "ON",
        "country": "Canada",
        "postal_code": "M5V 3A8",
        "address_type": "permanent",
        "is_primary": false
      }
    ],
    "eligibility_status": {
      "classes_completed": true,
      "fees_paid": true,
      "assignments_submitted": true,
      "documents_submitted": true,
      "trainer_consent": true,
      "override_requested": false,
      "requested_by": null,
      "reason": null,
      "comments": "All requirements met",
      "overall_status": "eligible"
    },
    "student_lifestyle": {
      "currently_working": false,
      "working_hours": null,
      "has_dependents": false,
      "married": false,
      "driving_license": true,
      "own_vehicle": false,
      "public_transport_only": true,
      "can_travel_long_distance": true,
      "drop_support_available": false,
      "fully_flexible": true,
      "rush_placement_required": false,
      "preferred_days": "Monday,Tuesday,Wednesday,Thursday,Friday",
      "preferred_time_slots": "9:00 AM - 5:00 PM",
      "additional_notes": "Available for full-time placement"
    },
    "placement_preferences": {
      "preferred_states": "MA,NY,CA,WA",
      "preferred_cities": "Boston,New York,San Francisco,Seattle",
      "max_travel_distance_km": 50,
      "morning_only": false,
      "evening_only": false,
      "night_shift": false,
      "weekend_only": false,
      "part_time": false,
      "full_time": true,
      "with_friend": true,
      "friend_name_or_id": "John Doe",
      "with_spouse": false,
      "spouse_name_or_id": null,
      "earliest_start_date": "2024-02-01",
      "latest_start_date": "2024-06-01",
      "specific_month_preference": "March 2024",
      "urgency_level": "flexible",
      "additional_preferences": "Prefer tech companies, remote work options preferred"
    },
    "facility_records": [
      {
        "facility_name": "Tech Corp Inc",
        "facility_type": "Technology",
        "branch_site": "Boston Branch",
        "facility_address": "789 Tech Park, Boston, MA 02116",
        "contact_person_name": "HR Manager",
        "contact_email": "hr@techcorp.com",
        "contact_phone": "+1555123456",
        "supervisor_name": "Jane Wilson",
        "distance_from_student_km": 15,
        "slot_id": "TECH001",
        "course_type": "Software Development",
        "shift_timing": "Day Shift",
        "start_date": "2024-03-01",
        "duration_hours": 160,
        "gender_requirement": "any",
        "applied_on": "2024-01-15",
        "student_confirmed": false,
        "student_comments": "Interested in this opportunity",
        "document_type": "Resume",
        "file_path": "/documents/resume_jane_smith.pdf",
        "application_status": "applied"
      },
      {
        "facility_name": "Data Analytics LLC",
        "facility_type": "Finance",
        "branch_site": "Downtown Office",
        "facility_address": "321 Business District, Boston, MA 02110",
        "contact_person_name": "Recruiter",
        "contact_email": "careers@dataanalytics.com",
        "contact_phone": "+1555987654",
        "supervisor_name": "Mike Johnson",
        "distance_from_student_km": 25,
        "slot_id": "DATA002",
        "course_type": "Data Science",
        "shift_timing": "Flexible",
        "start_date": "2024-04-01",
        "duration_hours": 120,
        "gender_requirement": "any",
        "applied_on": "2024-01-20",
        "student_confirmed": true,
        "student_comments": "This role matches my career goals",
        "document_type": "Cover Letter",
        "file_path": "/documents/cover_letter_jane_smith.pdf",
        "application_status": "confirmed"
      }
    ],
    "address_change_requests": [
      {
        "current_address": "123 University Ave, Boston, MA 02115",
        "new_address": "789 New Street, Cambridge, MA 02138",
        "effective_date": "2024-03-01",
        "change_reason": "Relocating closer to workplace",
        "impact_acknowledged": true,
        "status": "pending",
        "reviewed_at": null,
        "reviewed_by": null,
        "review_comments": null
      }
    ],
    "job_status_updates": [
      {
        "status": "Actively Searching",
        "last_updated_on": "2024-01-25",
        "employer_name": null,
        "job_role": null,
        "start_date": null,
        "employment_type": null,
        "offer_letter_path": null,
        "actively_applying": true,
        "expected_timeline": "Within 2 months",
        "searching_comments": "Applying to tech and data analytics positions",
        "created_at": "2024-01-25T10:30:00Z"
      },
      {
        "status": "Interview Scheduled",
        "last_updated_on": "2024-01-30",
        "employer_name": "Tech Corp Inc",
        "job_role": "Junior Software Developer",
        "start_date": "2024-03-01",
        "employment_type": "Full-time",
        "offer_letter_path": null,
        "actively_applying": true,
        "expected_timeline": "Interview outcome expected soon",
        "searching_comments": "Technical interview scheduled for next week",
        "created_at": "2024-01-30T14:15:00Z"
      }
    ]
  }'
```

## What This Complete Payload Creates:

### 1. **Student Record**
- Basic student information with all fields

### 2. **Contact Details** 
- Email: `jane.smith@example.com` (becomes loginID for user creation)
- Mobile, emergency contact, etc.

### 3. **Visa Details**
- F1 visa information
- Expiry dates and status

### 4. **Addresses** (Multiple)
- Current address in Boston
- Permanent address in Canada

### 5. **Eligibility Status**
- All eligibility criteria completed
- Overall status: "eligible"

### 6. **Student Lifestyle**
- Work preferences and availability
- Transportation and flexibility details

### 7. **Placement Preferences** (Complete)
- Location preferences (states/cities)
- Shift preferences (morning/evening/night)
- Work type preferences (part-time/full-time)
- Companion preferences (with friend/spouse)
- Timeline and urgency preferences
- Additional preferences

### 8. **Facility Records** (Multiple)
- Two different facility applications
- Complete facility information
- Contact details and supervisor info
- Application status tracking
- Document management

### 9. **Address Change Requests**
- Pending address change request
- Reason and effective date

### 10. **Job Status Updates** (Multiple)
- Job search activity tracking
- Interview scheduling
- Application status updates

### 11. **Automatic User Creation**
- **loginID**: `jane.smith@example.com`
- **password**: `test123`
- **userRole**: `student`
- **status**: `active`

## Key Points:

1. **Email is Critical**: The email in `contact_details.email` is used to create the user account
2. **Arrays for Multiple Records**: `addresses`, `facility_records`, `address_change_requests`, and `job_status_updates` can all be arrays
3. **All Fields Optional**: Every field except basic student info and email is optional
4. **Automatic User Creation**: Happens automatically when email is provided
5. **Relationship Management**: All related records are properly linked to the student

## Response Expected:

The API will return a complete student object with all the created relationships, and you can verify the user was created by checking the `users` table for `loginID = 'jane.smith@example.com'`.