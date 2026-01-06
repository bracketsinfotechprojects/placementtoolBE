# Student API - Quick Start

## Create Student with User Account

### cURL Command
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

### Request Body

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
    "primary_mobile": "+91-9876543210"
  }
}
```

### Required Fields
- `first_name` - Student's first name
- `last_name` - Student's last name
- `dob` - Date of birth (YYYY-MM-DD)
- `email` - Email for user account (if creating user)
- `password` - Password for user account (required if email provided)

### Optional Fields
- `gender` - male/female/other
- `nationality` - Student's nationality
- `student_type` - domestic/international (default: domestic)
- `status` - active/inactive/graduated/withdrawn (default: active)
- `contact_details` - Contact information

---

## Password Requirements

✓ 8-128 characters
✓ At least one UPPERCASE letter (A-Z)
✓ At least one lowercase letter (a-z)
✓ At least one number (0-9)
✓ At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Valid Examples:**
- `StudentPassword123!`
- `SecurePass456@`
- `MyPassword789#`

**Invalid Examples:**
- `student123` - No uppercase, no special char
- `Student123` - No special character
- `Student!` - Too short, no number

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

## Error Response

### Missing Password
```json
{
  "error": {
    "message": "Failed to create user account: Password is required for user account creation"
  },
  "success": false
}
```

### Weak Password
```json
{
  "error": {
    "message": "Failed to create user account: Password validation failed: Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  },
  "success": false
}
```

---

## Verify in Database

### Check Student
```sql
SELECT * FROM students WHERE first_name = 'John';
```

### Check User Account
```sql
SELECT id, loginID, password, roleID, status FROM users WHERE loginID = 'john.doe@example.com';
```

**Password should be:** `$2b$12$...` (bcrypt hash)
**NOT:** `StudentPassword123!` (plain text)

---

## Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "john.doe@example.com",
    "password": "StudentPassword123!"
  }'
```

---

## What Happens

1. ✅ Student record created in `students` table
2. ✅ Password validated for strength
3. ✅ Password hashed with bcrypt
4. ✅ User account created in `users` table
5. ✅ Student role assigned to user
6. ✅ Transaction committed
7. ✅ Student data returned (without password)

---

## Key Points

✅ Password is encrypted with bcrypt (12 salt rounds)
✅ Password is never stored in plain text
✅ Password is never returned in API responses
✅ User can login with email and password
✅ Transaction ensures data consistency
✅ Admin authentication required

---

## Examples

### Create Domestic Student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Raj",
    "last_name": "Kumar",
    "dob": "2000-05-10",
    "nationality": "Indian",
    "student_type": "domestic",
    "email": "raj@example.com",
    "password": "RajPassword123!"
  }'
```

### Create International Student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "Smith",
    "dob": "1999-03-20",
    "nationality": "USA",
    "student_type": "international",
    "email": "alice@example.com",
    "password": "AlicePassword456!"
  }'
```

### Create Student Without User Account
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Bob",
    "last_name": "Wilson",
    "dob": "2001-07-15",
    "nationality": "Indian",
    "student_type": "domestic"
  }'
```

---

## Troubleshooting

### "Password is required"
→ Include password in request when email is provided

### "Password validation failed"
→ Ensure password meets all requirements

### "Role 'student' not found"
→ Verify 'student' role exists in database

### "Unauthorized access"
→ Check JWT token is valid and user is admin

---

## Summary

✅ Student API now accepts password
✅ Password is encrypted with bcrypt
✅ User account created automatically
✅ Ready for production use

**Start using it now!**