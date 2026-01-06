# Student API User Creation - Curl Command Examples

## Complete Curl Command to Add New Student with Automatic User Creation

### Basic Example (Minimal Data)
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "dob": "1995-05-15",
    "gender": "male",
    "nationality": "American",
    "student_type": "international",
    "status": "active",
    "contact_details": {
      "primary_mobile": "+1234567890",
      "email": "john.doe@example.com",
      "emergency_contact": "+0987654321",
      "contact_type": "mobile",
      "is_primary": true
    }
  }'
```

### Complete Example (With All Optional Data)
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
      "public_transport_only": true,
      "can_travel_long_distance": true,
      "fully_flexible": true
    },
    "placement_preferences": {
      "preferred_states": "MA,NY,CA",
      "preferred_cities": "Boston,New York,San Francisco",
      "max_travel_distance_km": 50,
      "morning_only": false,
      "evening_only": false,
      "night_shift": false,
      "weekend_only": false,
      "part_time": false,
      "full_time": true,
      "urgency_level": "flexible"
    }
  }'
```

### What Happens When You Run This Command:

1. **Student Record Created**: A new student is created with all the provided information
2. **Contact Details Created**: Contact details are stored including the email address
3. **User Account Automatically Created**: 
   - `loginID`: `jane.smith@example.com` (from contact_details.email)
   - `password`: `test123`
   - `userRole`: `student`
   - `status`: `active`

### Expected API Response:
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "student_id": 123,
    "first_name": "Jane",
    "last_name": "Smith",
    "full_name": "Jane Smith",
    "dob": "1996-08-20T00:00:00.000Z",
    "age": 28,
    "gender": "female",
    "nationality": "Canadian",
    "student_type": "international",
    "status": "active",
    "contact_details": [...],
    "visa_details": [...],
    "addresses": [...],
    "createdAt": "2024-01-05T06:52:20.000Z",
    "updatedAt": "2024-01-05T06:52:20.000Z"
  }
}
```

### Verification Steps:

After running the curl command, you can verify the user was created by checking the database:

```sql
-- Check if user was created
SELECT * FROM users WHERE loginID = 'jane.smith@example.com';

-- Should return:
-- id: 456
-- loginID: 'jane.smith@example.com'
-- password: 'test123'
-- userRole: 'student'
-- status: 'active'
-- created_at: [current timestamp]
```

### Important Notes:

1. **Email Required**: The email must be provided in `contact_details.email` for user creation to work
2. **Unique Email**: Each email can only be used once (unique constraint on loginID)
3. **Error Handling**: If user creation fails, the student creation continues but a warning is logged
4. **Server Must Be Running**: The API server must be running on port 3000 (or whatever port is configured)

### Troubleshooting:

If you get connection errors:
```bash
# Check if server is running
curl http://localhost:3000/api/health

# Or check if the students endpoint exists
curl http://localhost:3000/api/students
```

### Different Server Port:
If your server runs on a different port, change the URL:
```bash
curl -X POST http://localhost:5555/api/students ...