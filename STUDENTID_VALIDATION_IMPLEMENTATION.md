# StudentID Field Implementation & Validation

## Overview
Added `studentID` field to the `users` table to create a direct link between User and Student entities, with strict validation to ensure only Student role users can have this field populated.

## Changes Made

### 1. User Entity (`src/entities/user/user.entity.ts`)
- **Added `studentID` field**: Nullable integer field to store the student_id foreign key
- **Added validation hooks**: `@BeforeInsert()` and `@BeforeUpdate()` decorators with `validateStudentID()` method
- **Validation rules**:
  - If `studentID` is provided, user MUST have roleID = 6 (Student role)
  - If user has roleID = 6 (Student), `studentID` MUST be provided
  - Non-student users (Admin, Facility, etc.) will have `studentID = NULL`

### 2. User Service (`src/services/user/user.service.ts`)
- **Updated `ICreateUser` interface**: Added optional `studentID` field
- **Updated `IUpdateUser` interface**: Added optional `studentID` field
- **Enhanced `create()` function**:
  - Validates that `studentID` is only provided for Student role users
  - Requires `studentID` when creating Student role users
  - Logs the `studentID` value during user creation
- **Enhanced `update()` function**:
  - Prevents changing role from Student to another role when `studentID` is set
  - Validates `studentID` changes based on role

### 3. Student Service (`src/services/student/student.service.ts`)
- **Already correctly implemented**: Sets `user.studentID = studentData.student_id` when creating user account
- **Transaction safety**: Both student and user creation happen in same transaction
- **Rollback protection**: If user creation fails, student record is rolled back

### 4. Database Migration (`src/migrations/1704205800000-CompleteEntityMatchingSchema.ts`)
- **Updated users table schema**: Added `studentID` column (nullable int)
- **Added index**: `IDX_users_studentID` for better query performance

### 5. New Migration (`src/migrations/1704205900000-AddStudentIDToUsers.ts`)
- **Adds `studentID` column** to existing databases
- **Safety check**: Verifies if column already exists before adding
- **Includes index**: Creates index on `studentID` for performance
- **Reversible**: Includes `down()` method to remove the column

## Validation Rules Summary

| User Role | studentID Value | Validation |
|-----------|----------------|------------|
| Student (roleID = 6) | REQUIRED | Must provide valid student_id |
| Admin (roleID = 1) | NULL | Cannot have studentID |
| Facility (roleID = 2) | NULL | Cannot have studentID |
| Supervisor (roleID = 3) | NULL | Cannot have studentID |
| Placement Executive (roleID = 4) | NULL | Cannot have studentID |
| Trainer (roleID = 5) | NULL | Cannot have studentID |

## Student Registration Flow

When registering a student through the Student API:

1. **Student record created** → `students` table gets new record with `student_id`
2. **User account created** → `users` table gets new record with:
   - `loginID` = student's email
   - `password` = hashed password
   - `roleID` = 6 (Student role)
   - `studentID` = the `student_id` from step 1 ✅
   - `status` = 'active'

3. **Transaction committed** → Both records saved together
4. **If any step fails** → Complete rollback, no partial data

## Benefits

1. **Direct relationship**: No need to search by email to find student
2. **Better performance**: Indexed foreign key for fast lookups
3. **Data integrity**: Validation ensures only students have studentID
4. **Type safety**: Prevents accidental misuse of the field
5. **Transaction safety**: Rollback protection ensures data consistency

## Testing

To verify the implementation:

```bash
# Run migrations
npm run migration:run

# Test student creation (should succeed)
POST /api/students
{
  "first_name": "John",
  "last_name": "Doe",
  "dob": "2000-01-01",
  "contact_details": {
    "email": "john.doe@example.com"
  },
  "password": "SecurePass123"
}

# Verify user record has studentID populated
SELECT id, loginID, roleID, studentID FROM users WHERE loginID = 'john.doe@example.com';

# Test creating non-student user with studentID (should fail)
POST /api/users
{
  "loginID": "admin@example.com",
  "password": "AdminPass123",
  "userRole": "Admin",
  "studentID": 123  // ❌ Should throw error
}
```

## Error Messages

- `"studentID can only be set for users with Student role (roleID = 6)"`
- `"Student role users must have a studentID"`
- `"studentID can only be provided for Student role users"`
- `"studentID is required when creating a Student role user"`
- `"Cannot change role from Student to another role when studentID is set"`
