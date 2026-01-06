# Student API User Creation Implementation

## Overview

The student API creation has been enhanced to automatically create user accounts when students are created via the API. This ensures that every student gets a corresponding user account for authentication purposes.

## Changes Made

### 1. Student Service Enhancement (`src/services/student/student.service.ts`)

**Added imports:**
```typescript
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { User } from '../../entities/user/user.entity';
import UserService from '../user/user.service';
```

**Enhanced Student Creation Interface:**
```typescript
export interface ICreateStudent {
  first_name: string;
  last_name: string;
  dob: Date;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  email?: string; // Email for automatic user account creation
}
```

**Modified Create Function:**
The `create` function now automatically creates a user account when an email is provided:

```typescript
const create = async (params: ICreateStudent) => {
  // ... existing student creation code ...
  
  // If email is provided in params, create user account automatically
  if (params.email) {
    try {
      await UserService.create({
        loginID: params.email,
        password: 'test123',
        userRole: 'student',
        status: 'active'
      });
    } catch (userError) {
      // Log the error but don't fail student creation
      console.warn('Failed to create user account for student:', userError.message);
    }
  }
  
  return ApiUtility.sanitizeStudent(studentData);
};
```

### 2. Student Controller Enhancement (`src/controllers/student/student.controller.ts`)

**Enhanced Create Method:**
The controller now extracts the email from contact details and passes it to the service:

```typescript
static async create(req: Request, res: Response) {
  try {
    // Extract email from contact details if provided
    let email: string | undefined;
    if (req.body.contact_details && req.body.contact_details.email) {
      email = req.body.contact_details.email;
    }

    const studentData: ICreateStudent = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      dob: req.body.dob,
      gender: req.body.gender,
      nationality: req.body.nationality,
      student_type: req.body.student_type || 'domestic',
      status: req.body.status || 'active',
      email: email // Pass email for automatic user creation
    };

    const student = await StudentService.create(studentData);
    // ... rest of the existing code ...
```

## User Account Details

When a student is created via the API with an email address, the following user account is automatically created:

- **loginID**: The student's email address from contact details
- **password**: `test123` (as specified in requirements)
- **userRole**: `student` (as specified in requirements)
- **status**: `active` (default active status)

## API Usage Example

### Request Payload
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "dob": "1995-05-15",
  "gender": "male",
  "nationality": "American",
  "student_type": "international",
  "status": "active",
  "contact_details": {
    "primary_mobile": "+1234567890",
    "email": "john.doe@example.com",  // This email becomes the loginID
    "emergency_contact": "+0987654321",
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
  "addresses": [{
    "line1": "123 University Ave",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "postal_code": "02115",
    "address_type": "current",
    "is_primary": true
  }]
}
```

### Expected Behavior
1. **Student Record**: A new student record is created with all the provided details
2. **Contact Details**: Contact details are created with the email address
3. **User Account**: A user account is automatically created with:
   - loginID: `john.doe@example.com`
   - password: `test123`
   - userRole: `student`
   - status: `active`

## Error Handling

- If user creation fails, the student creation continues normally
- A warning is logged if user account creation fails
- The system uses email uniqueness constraint to prevent duplicate loginIDs

## Testing

Two test files have been created:

1. **Direct Database Test** (`test-student-user-creation-direct.js`): Tests the database operations directly
2. **API Test** (`test-student-user-creation.js`): Tests the complete API flow

## Security Considerations

- **Password**: Currently using plain text `test123` - in production, this should be hashed
- **Email Uniqueness**: The system enforces unique loginIDs (emails)
- **Role Assignment**: Students are automatically assigned the `student` role

## Dependencies

- Requires the `users` table to exist
- Requires the `UserService` to be properly configured
- Requires proper database connections and TypeORM setup

## Future Enhancements

1. **Password Hashing**: Implement proper password hashing for security
2. **Email Verification**: Add email verification process
3. **Role Management**: Consider using the separate `roles` table and `user_roles` junction table
4. **Error Recovery**: Implement rollback mechanisms for failed operations
5. **Logging**: Add comprehensive logging for audit trails
