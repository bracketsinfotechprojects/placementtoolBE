# Student API - With Password Encryption

## Overview

The student creation API has been updated to accept password in the request payload and automatically encrypt it before storing in the users table.

---

## What Changed

### Before
- Student creation did NOT accept password
- A hardcoded password `'test123'` was used
- Password was stored as plain text

### After
- Student creation NOW accepts password in the payload
- Password is validated for strength requirements
- Password is encrypted with bcrypt before storage
- User account is created with encrypted password

---

## API Endpoint

### Create Student with User Account

**Endpoint:** `POST /api/students`

**Authentication:** Required (Admin only)

**Request Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
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
    "email": "john.doe@example.com",
    "primary_mobile": "+91-9876543210",
    "emergency_contact": "+91-9876543211"
  }
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `first_name` | string | Yes | Student's first name |
| `last_name` | string | Yes | Student's last name |
| `dob` | date | Yes | Date of birth (YYYY-MM-DD) |
| `gender` | string | No | Gender (male/female/other) |
| `nationality` | string | No | Student's nationality |
| `student_type` | string | No | domestic or international (default: domestic) |
| `status` | string | No | active, inactive, graduated, withdrawn (default: active) |
| `email` | string | No | Email for user account creation |
| `password` | string | Conditional | Required if email is provided |
| `contact_details` | object | No | Contact information |

**Password Requirements:**
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

---

## Success Response (201 Created)

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

## Error Responses

### Missing Password (400 Bad Request)
```json
{
  "error": {
    "message": "Failed to create user account: Password is required for user account creation"
  },
  "success": false
}
```

### Invalid Password (400 Bad Request)
```json
{
  "error": {
    "message": "Failed to create user account: Password validation failed: Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  },
  "success": false
}
```

### Unauthorized (401 Unauthorized)
```json
{
  "error": {
    "message": "Unauthorized access"
  },
  "success": false
}
```

---

## cURL Examples

### Create Student with User Account

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
      "email": "john.doe@example.com",
      "primary_mobile": "+91-9876543210"
    }
  }'
```

### Create Student Without User Account

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "dob": "2001-05-20",
    "gender": "female",
    "nationality": "Indian",
    "student_type": "domestic",
    "status": "active"
  }'
```

### Create International Student

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Johnson",
    "dob": "1999-03-10",
    "gender": "female",
    "nationality": "USA",
    "student_type": "international",
    "status": "active",
    "email": "alice.johnson@example.com",
    "password": "SecurePassword456!"
  }'
```

---

## Database Verification

### Check Student Record
```sql
SELECT student_id, first_name, last_name, email FROM students WHERE student_id = 1;
```

### Check User Account
```sql
SELECT id, loginID, password, roleID, status FROM users WHERE loginID = 'john.doe@example.com';
```

**Expected Password Format:** `$2b$12$...` (bcrypt hash)
**NOT:** `StudentPassword123!` (plain text)

---

## How It Works

### Step 1: Validate Input
- Check if email is provided
- If email provided, check if password is provided
- Validate password strength

### Step 2: Hash Password
- Use bcrypt with 12 salt rounds
- Generate unique salt for each password
- Create irreversible hash

### Step 3: Create Records
- Create student record in students table
- Create user record in users table with hashed password
- Assign student role to user

### Step 4: Transaction Management
- If any step fails, entire transaction is rolled back
- Ensures data consistency
- No orphaned records

---

## Security Features

✅ **Password Encryption**
- Bcrypt with 12 salt rounds
- Unique salt for each password
- Impossible to reverse-engineer

✅ **Password Validation**
- Strong password requirements enforced
- Minimum 8 characters
- Must include uppercase, lowercase, number, special character

✅ **Transaction Safety**
- All-or-nothing approach
- Rollback on any failure
- No partial data creation

✅ **Admin Only**
- Requires admin authentication
- JWT token validation
- Role-based access control

✅ **Secure Storage**
- Passwords never logged
- Passwords never returned in API responses
- Passwords excluded from student details

---

## Password Examples

### Valid Passwords
- `StudentPassword123!`
- `SecurePass456@`
- `MyPassword789#`
- `Test@Pass2024`

### Invalid Passwords
- `student123` - No uppercase, no special char
- `Student123` - No special character
- `Student!` - Too short, no number
- `STUDENT123!` - No lowercase

---

## API Flow Diagram

```
POST /api/students
    ↓
Validate Input
    ↓
Check Email & Password
    ↓
Validate Password Strength
    ↓
Start Transaction
    ↓
Create Student Record
    ↓
Hash Password (bcrypt)
    ↓
Create User Record
    ↓
Assign Student Role
    ↓
Commit Transaction
    ↓
Return Student Data (without password)
```

---

## Related Endpoints

### Get Student Details
```bash
GET /api/students/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Student with User Account
```bash
GET /api/students/:id/with-user-details
Authorization: Bearer YOUR_JWT_TOKEN
```

### List Students
```bash
GET /api/students?limit=10&page=1
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update Student
```bash
PUT /api/students/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### Delete Student
```bash
DELETE /api/students/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Testing

### Using Postman
1. Import the Postman collection
2. Set JWT token variable
3. Use the "Create Student" request
4. Add password to the request body
5. Send the request

### Using cURL
See examples above

### Verify in Database
```sql
-- Check student created
SELECT * FROM students WHERE first_name = 'John';

-- Check user created
SELECT id, loginID, roleID, status FROM users WHERE loginID = 'john.doe@example.com';

-- Verify password is hashed
SELECT password FROM users WHERE loginID = 'john.doe@example.com';
-- Should show: $2b$12$... (not plain text)
```

---

## Troubleshooting

### Issue: "Password is required for user account creation"
**Solution:** Include password in the request body when email is provided

### Issue: "Password validation failed"
**Solution:** Ensure password meets all requirements (8+ chars, uppercase, lowercase, number, special char)

### Issue: "Role 'student' not found in database"
**Solution:** Verify the 'student' role exists in the roles table

### Issue: Transaction rolled back
**Solution:** Check server logs for detailed error message

---

## Best Practices

1. **Always provide password** when creating student with email
2. **Use strong passwords** that meet all requirements
3. **Never share passwords** in logs or emails
4. **Verify in database** that password is hashed
5. **Test thoroughly** before production deployment

---

## Summary

✅ Student creation now accepts password in payload
✅ Password is validated for strength
✅ Password is encrypted with bcrypt
✅ User account is created automatically
✅ Transaction ensures data consistency
✅ Secure and production-ready

**Start using the updated API!**