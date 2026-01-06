# Create Student with ALL Data Fields

## Complete cURL Command

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "dob": "2000-01-15",
    "gender": "male",
    "nationality": "Indian",
    "student_type": "domestic",
    "status": "active",
    "email": "john.doe@example.com",
    "password": "StudentPassword123!",
    "contact_details": {
      "primary_mobile": "+91-9876543210",
      "email": "john.doe@example.com",
      "emergency_contact": "+91-9876543211",
      "contact_type": "mobile",
      "is_primary": true,
      "verified_at": "2026-01-05T10:30:00.000Z"
    },
    "visa_details": {
      "visa_type": "Student Visa",
      "visa_number": "VIS123456789",
      "start_date": "2024-01-01",
      "expiry_date": "2026-01-01",
      "status": "active",
      "issuing_country": "India",
      "document_path": "/documents/visa.pdf"
    },
    "addresses": [
      {
        "line1": "123 Main Street",
        "city": "Bangalore",
        "state": "Karnataka",
        "country": "India",
        "postal_code": "560001",
        "address_type": "current",
        "is_primary": true
      },
      {
        "line1": "456 Home Lane",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "postal_code": "400001",
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
      "requested_by": "Admin",
      "reason": "Regular completion",
      "comments": "All requirements met",
      "overall_status": "eligible"
    },
    "student_lifestyle": {
      "currently_working": false,
      "working_hours": "N/A",
      "has_dependents": false,
      "married": false,
      "driving_license": true,
      "own_vehicle": true,
      "public_transport_only": false,
      "can_travel_long_distance": true,
      "drop_support_available": true,
      "fully_flexible": true,
      "rush_placement_required": false,
      "preferred_days": "Monday to Friday",
      "preferred_time_slots": "9 AM to 5 PM",
      "additional_notes": "Available for immediate placement"
    },
    "placement_preferences": {
      "preferred_states": "Karnataka, Maharashtra, Tamil Nadu",
      "preferred_cities": "Bangalore, Mumbai, Chennai",
      "max_travel_distance_km": 50,
      "morning_only": false,
      "evening_only": false,
      "night_shift": false,
      "weekend_only": false,
      "part_time": false,
      "full_time": true,
      "with_friend": false,
      "friend_name_or_id": "",
      "with_spouse": false,
      "spouse_name_or_id": "",
      "earliest_start_date": "2026-02-01",
      "latest_start_date": "2026-03-31",
      "specific_month_preference": "February 2026",
      "urgency_level": "immediate",
      "additional_preferences": "Prefer IT sector companies"
    },
    "facility_records": [
      {
        "facility_name": "Tech Training Center",
        "facility_type": "Training Center",
        "branch_site": "Bangalore",
        "facility_address": "123 Tech Park, Bangalore",
        "contact_person_name": "Mr. Sharma",
        "contact_email": "sharma@techcenter.com",
        "contact_phone": "+91-9876543210",
        "supervisor_name": "Ms. Priya",
        "distance_from_student_km": 5,
        "slot_id": "SLOT001",
        "course_type": "Full Stack Development",
        "shift_timing": "9 AM - 5 PM",
        "start_date": "2026-01-15",
        "duration_hours": 160,
        "gender_requirement": "Any",
        "applied_on": "2026-01-05",
        "student_confirmed": true,
        "student_comments": "Excited to start",
        "document_type": "Offer Letter",
        "file_path": "/documents/offer_letter.pdf",
        "application_status": "confirmed"
      }
    ],
    "address_change_requests": [
      {
        "current_address": "123 Main Street, Bangalore",
        "new_address": "789 New Avenue, Bangalore",
        "effective_date": "2026-02-01",
        "change_reason": "Relocation for placement",
        "impact_acknowledged": true,
        "status": "pending",
        "reviewed_at": null,
        "reviewed_by": null,
        "review_comments": null
      }
    ],
    "job_status_updates": [
      {
        "status": "actively_searching",
        "last_updated_on": "2026-01-05",
        "employer_name": null,
        "job_role": null,
        "start_date": null,
        "employment_type": null,
        "offer_letter_path": null,
        "actively_applying": true,
        "expected_timeline": "Within 2 weeks",
        "searching_comments": "Looking for entry-level positions"
      }
    ]
  }'
```

---

## Field Descriptions

### Student Basic Info
| Field | Type | Description |
|-------|------|-------------|
| `first_name` | string | Student's first name |
| `last_name` | string | Student's last name |
| `dob` | date | Date of birth (YYYY-MM-DD) |
| `gender` | string | male/female/other |
| `nationality` | string | Student's nationality |
| `student_type` | string | domestic/international |
| `status` | string | active/inactive/graduated/withdrawn |
| `email` | string | Email for user account |
| `password` | string | Password (encrypted with bcrypt) |

### Contact Details
| Field | Type | Description |
|-------|------|-------------|
| `primary_mobile` | string | Primary mobile number |
| `email` | string | Email address |
| `emergency_contact` | string | Emergency contact number |
| `contact_type` | string | mobile/landline/whatsapp |
| `is_primary` | boolean | Is this primary contact |
| `verified_at` | datetime | When contact was verified |

### Visa Details
| Field | Type | Description |
|-------|------|-------------|
| `visa_type` | string | Type of visa |
| `visa_number` | string | Visa number |
| `start_date` | date | Visa start date |
| `expiry_date` | date | Visa expiry date |
| `status` | string | active/expired/revoked/pending |
| `issuing_country` | string | Country that issued visa |
| `document_path` | string | Path to visa document |

### Addresses
| Field | Type | Description |
|-------|------|-------------|
| `line1` | string | Address line 1 |
| `city` | string | City |
| `state` | string | State/Province |
| `country` | string | Country |
| `postal_code` | string | Postal code |
| `address_type` | string | current/permanent/temporary/mailing |
| `is_primary` | boolean | Is this primary address |

### Eligibility Status
| Field | Type | Description |
|-------|------|-------------|
| `classes_completed` | boolean | Classes completed |
| `fees_paid` | boolean | Fees paid |
| `assignments_submitted` | boolean | Assignments submitted |
| `documents_submitted` | boolean | Documents submitted |
| `trainer_consent` | boolean | Trainer consent |
| `override_requested` | boolean | Override requested |
| `requested_by` | string | Who requested override |
| `reason` | string | Reason for override |
| `comments` | string | Additional comments |
| `overall_status` | string | eligible/not_eligible/pending/override |

### Student Lifestyle
| Field | Type | Description |
|-------|------|-------------|
| `currently_working` | boolean | Currently working |
| `working_hours` | string | Working hours |
| `has_dependents` | boolean | Has dependents |
| `married` | boolean | Married status |
| `driving_license` | boolean | Has driving license |
| `own_vehicle` | boolean | Owns vehicle |
| `public_transport_only` | boolean | Uses public transport only |
| `can_travel_long_distance` | boolean | Can travel long distance |
| `drop_support_available` | boolean | Drop support available |
| `fully_flexible` | boolean | Fully flexible |
| `rush_placement_required` | boolean | Rush placement required |
| `preferred_days` | string | Preferred working days |
| `preferred_time_slots` | string | Preferred time slots |
| `additional_notes` | string | Additional notes |

### Placement Preferences
| Field | Type | Description |
|-------|------|-------------|
| `preferred_states` | string | Preferred states |
| `preferred_cities` | string | Preferred cities |
| `max_travel_distance_km` | number | Max travel distance |
| `morning_only` | boolean | Morning shift only |
| `evening_only` | boolean | Evening shift only |
| `night_shift` | boolean | Night shift |
| `weekend_only` | boolean | Weekend only |
| `part_time` | boolean | Part-time |
| `full_time` | boolean | Full-time |
| `with_friend` | boolean | With friend |
| `friend_name_or_id` | string | Friend name/ID |
| `with_spouse` | boolean | With spouse |
| `spouse_name_or_id` | string | Spouse name/ID |
| `earliest_start_date` | date | Earliest start date |
| `latest_start_date` | date | Latest start date |
| `specific_month_preference` | string | Specific month preference |
| `urgency_level` | string | immediate/within_month/within_quarter/flexible |
| `additional_preferences` | string | Additional preferences |

### Facility Records
| Field | Type | Description |
|-------|------|-------------|
| `facility_name` | string | Facility name |
| `facility_type` | string | Type of facility |
| `branch_site` | string | Branch/Site |
| `facility_address` | string | Facility address |
| `contact_person_name` | string | Contact person name |
| `contact_email` | string | Contact email |
| `contact_phone` | string | Contact phone |
| `supervisor_name` | string | Supervisor name |
| `distance_from_student_km` | number | Distance from student |
| `slot_id` | string | Slot ID |
| `course_type` | string | Course type |
| `shift_timing` | string | Shift timing |
| `start_date` | date | Start date |
| `duration_hours` | number | Duration in hours |
| `gender_requirement` | string | Gender requirement |
| `applied_on` | date | Applied on date |
| `student_confirmed` | boolean | Student confirmed |
| `student_comments` | string | Student comments |
| `document_type` | string | Document type |
| `file_path` | string | File path |
| `application_status` | string | applied/under_review/accepted/rejected/confirmed/completed |

### Address Change Requests
| Field | Type | Description |
|-------|------|-------------|
| `current_address` | string | Current address |
| `new_address` | string | New address |
| `effective_date` | date | Effective date |
| `change_reason` | string | Reason for change |
| `impact_acknowledged` | boolean | Impact acknowledged |
| `status` | string | pending/approved/rejected/implemented |
| `reviewed_at` | datetime | Reviewed at |
| `reviewed_by` | string | Reviewed by |
| `review_comments` | string | Review comments |

### Job Status Updates
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Job status |
| `last_updated_on` | date | Last updated on |
| `employer_name` | string | Employer name |
| `job_role` | string | Job role |
| `start_date` | date | Start date |
| `employment_type` | string | Employment type |
| `offer_letter_path` | string | Offer letter path |
| `actively_applying` | boolean | Actively applying |
| `expected_timeline` | string | Expected timeline |
| `searching_comments` | string | Searching comments |

---

## Success Response

```json
{
  "data": {
    "student_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "dob": "2000-01-15",
    "gender": "male",
    "nationality": "Indian",
    "student_type": "domestic",
    "status": "active",
    "createdAt": "2026-01-05T10:30:00.000Z",
    "updatedAt": "2026-01-05T10:30:00.000Z"
  },
  "success": true,
  "message": "Student created successfully"
}
```

---

## Database Verification

### Check All Student Data
```sql
SELECT * FROM students WHERE student_id = 1;
SELECT * FROM contact_details WHERE student_id = 1;
SELECT * FROM visa_details WHERE student_id = 1;
SELECT * FROM addresses WHERE student_id = 1;
SELECT * FROM eligibility_status WHERE student_id = 1;
SELECT * FROM student_lifestyle WHERE student_id = 1;
SELECT * FROM placement_preferences WHERE student_id = 1;
SELECT * FROM facility_records WHERE student_id = 1;
SELECT * FROM address_change_requests WHERE student_id = 1;
SELECT * FROM job_status_updates WHERE student_id = 1;
```

### Check User Account
```sql
SELECT id, loginID, password, roleID, status FROM users WHERE loginID = 'john.doe@example.com';
```

### Verify Password is Encrypted
```sql
SELECT password FROM users WHERE loginID = 'john.doe@example.com';
```

**Expected:** `$2b$12$...` (bcrypt hash)

---

## Example with Different Data

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Priya",
    "last_name": "Sharma",
    "dob": "2001-05-20",
    "gender": "female",
    "nationality": "Indian",
    "student_type": "international",
    "status": "active",
    "email": "priya.sharma@example.com",
    "password": "PriyaSecure456!",
    "contact_details": {
      "primary_mobile": "+91-8765432109",
      "email": "priya.sharma@example.com",
      "emergency_contact": "+91-8765432108",
      "contact_type": "whatsapp",
      "is_primary": true
    },
    "visa_details": {
      "visa_type": "Student Visa",
      "visa_number": "VIS987654321",
      "start_date": "2024-06-01",
      "expiry_date": "2026-06-01",
      "status": "active",
      "issuing_country": "India"
    },
    "addresses": [
      {
        "line1": "789 Tech Street",
        "city": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "postal_code": "411001",
        "address_type": "current",
        "is_primary": true
      }
    ],
    "eligibility_status": {
      "classes_completed": true,
      "fees_paid": true,
      "assignments_submitted": true,
      "documents_submitted": true,
      "trainer_consent": true,
      "overall_status": "eligible"
    },
    "student_lifestyle": {
      "currently_working": false,
      "has_dependents": false,
      "married": false,
      "driving_license": true,
      "own_vehicle": false,
      "can_travel_long_distance": true,
      "fully_flexible": true,
      "preferred_days": "Monday to Friday",
      "preferred_time_slots": "10 AM to 6 PM"
    },
    "placement_preferences": {
      "preferred_states": "Maharashtra, Gujarat",
      "preferred_cities": "Pune, Ahmedabad",
      "max_travel_distance_km": 30,
      "full_time": true,
      "earliest_start_date": "2026-03-01",
      "latest_start_date": "2026-04-30",
      "urgency_level": "within_month"
    }
  }'
```

---

## Notes

✅ All fields are optional except `first_name`, `last_name`, and `dob`
✅ Password is required only if email is provided
✅ Password must meet strength requirements
✅ Multiple addresses, facility records, etc. can be added
✅ All data is stored in respective tables
✅ Transaction ensures consistency
✅ Password is encrypted with bcrypt

**Copy and customize the command for your needs!**