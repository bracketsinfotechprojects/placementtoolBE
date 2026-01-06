# User API - Test Cases

## Test Environment Setup

### Prerequisites
- Node.js server running on `http://localhost:3000`
- Valid JWT token for admin user
- Postman or cURL installed

### Test Data
```
Admin JWT Token: YOUR_JWT_TOKEN_HERE
Base URL: http://localhost:3000/api
```

---

## Test Case 1: Create User - Valid Request

**Test ID:** TC-001
**Endpoint:** POST /api/users
**Authentication:** Required (Admin)

**Test Data:**
```json
{
  "loginID": "john.doe@example.com",
  "password": "SecurePassword123!",
  "userRole": "user",
  "status": "active"
}
```

**Expected Result:**
- Status Code: 201 Created
- Response contains user ID
- Password is not returned in response
- User status is "active"

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "john.doe@example.com",
    "password": "SecurePassword123!",
    "userRole": "user",
    "status": "active"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "id": 1,
    "loginID": "john.doe@example.com",
    "roleID": 2,
    "status": "active",
    "createdAt": "2026-01-05T10:30:00.000Z",
    "updatedAt": "2026-01-05T10:30:00.000Z"
  },
  "success": true,
  "message": "User created successfully"
}
```

---

## Test Case 2: Create User - Invalid Password (Too Short)

**Test ID:** TC-002
**Endpoint:** POST /api/users
**Authentication:** Required (Admin)

**Test Data:**
```json
{
  "loginID": "jane.smith@example.com",
  "password": "Pass123!",
  "userRole": "user",
  "status": "active"
}
```

**Expected Result:**
- Status Code: 400 Bad Request
- Error message about password length
- User not created

**Expected Response:**
```json
{
  "error": {
    "message": "Password must be at least 8 characters long"
  },
  "success": false
}
```

---

## Test Case 3: Create User - Invalid Password (No Uppercase)

**Test ID:** TC-003
**Endpoint:** POST /api/users
**Authentication:** Required (Admin)

**Test Data:**
```json
{
  "loginID": "bob.wilson@example.com",
  "password": "password123!",
  "userRole": "user",
  "status": "active"
}
```

**Expected Result:**
- Status Code: 400 Bad Request
- Error message about uppercase requirement
- User not created

**Expected Response:**
```json
{
  "error": {
    "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  },
  "success": false
}
```

---

## Test Case 4: Create User - Invalid Password (No Special Character)

**Test ID:** TC-004
**Endpoint:** POST /api/users
**Authentication:** Required (Admin)

**Test Data:**
```json
{
  "loginID": "alice.johnson@example.com",
  "password": "Password123",
  "userRole": "user",
  "status": "active"
}
```

**Expected Result:**
- Status Code: 400 Bad Request
- Error message about special character requirement
- User not created

---

## Test Case 5: Create User - Missing Required Field

**Test ID:** TC-005
**Endpoint:** POST /api/users
**Authentication:** Required (Admin)

**Test Data:**
```json
{
  "loginID": "test@example.com"
}
```

**Expected Result:**
- Status Code: 400 Bad Request
- Error message about missing password
- User not created

---

## Test Case 6: Create User - Unauthorized (No Admin)

**Test ID:** TC-006
**Endpoint:** POST /api/users
**Authentication:** Required (Non-Admin)

**Test Data:**
```json
{
  "loginID": "user@example.com",
  "password": "SecurePassword123!",
  "userRole": "user",
  "status": "active"
}
```

**Expected Result:**
- Status Code: 401 Unauthorized
- Error message about insufficient permissions
- User not created

---

## Test Case 7: List Users - Valid Request

**Test ID:** TC-007
**Endpoint:** GET /api/users
**Authentication:** Required (Admin)

**Query Parameters:**
```
limit=10
page=1
```

**Expected Result:**
- Status Code: 200 OK
- Response contains array of users
- Pagination information included
- Passwords not returned

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/users?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "loginID": "john.doe@example.com",
      "roleID": 2,
      "status": "active",
      "createdAt": "2026-01-05T10:30:00.000Z",
      "updatedAt": "2026-01-05T10:30:00.000Z"
    }
  ],
  "success": true,
  "message": "Users retrieved successfully",
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "previousPage": null,
    "nextPage": null,
    "totalItems": 1
  }
}
```

---

## Test Case 8: List Users - Filter by Status

**Test ID:** TC-008
**Endpoint:** GET /api/users
**Authentication:** Required (Admin)

**Query Parameters:**
```
status=active
limit=10
page=1
```

**Expected Result:**
- Status Code: 200 OK
- Response contains only active users
- Pagination information included

---

## Test Case 9: List Users - Filter by Role

**Test ID:** TC-009
**Endpoint:** GET /api/users
**Authentication:** Required (Admin)

**Query Parameters:**
```
userRole=admin
limit=10
page=1
```

**Expected Result:**
- Status Code: 200 OK
- Response contains only admin users
- Pagination information included

---

## Test Case 10: List Users - Search by Keyword

**Test ID:** TC-010
**Endpoint:** GET /api/users
**Authentication:** Required (Admin)

**Query Parameters:**
```
keyword=john
limit=10
page=1
```

**Expected Result:**
- Status Code: 200 OK
- Response contains users matching keyword
- Pagination information included

---

## Test Case 11: Get User by ID - Valid Request

**Test ID:** TC-011
**Endpoint:** GET /api/users/:id
**Authentication:** Required (Admin)

**URL Parameter:**
```
id=1
```

**Expected Result:**
- Status Code: 200 OK
- Response contains user details
- Password not returned

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Test Case 12: Get User by ID - Invalid ID

**Test ID:** TC-012
**Endpoint:** GET /api/users/:id
**Authentication:** Required (Admin)

**URL Parameter:**
```
id=999
```

**Expected Result:**
- Status Code: 404 Not Found
- Error message about user not found

---

## Test Case 13: Update User - Valid Request

**Test ID:** TC-013
**Endpoint:** PUT /api/users/:id
**Authentication:** Required (Admin)

**URL Parameter:**
```
id=1
```

**Request Body:**
```json
{
  "password": "NewSecurePassword123!",
  "status": "active"
}
```

**Expected Result:**
- Status Code: 200 OK
- User updated successfully
- New password is hashed
- Password not returned in response

**cURL Command:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePassword123!",
    "status": "active"
  }'
```

---

## Test Case 14: Update User - Invalid Password

**Test ID:** TC-014
**Endpoint:** PUT /api/users/:id
**Authentication:** Required (Admin)

**URL Parameter:**
```
id=1
```

**Request Body:**
```json
{
  "password": "weak"
}
```

**Expected Result:**
- Status Code: 400 Bad Request
- Error message about password requirements
- User not updated

---

## Test Case 15: Update User - Change Role

**Test ID:** TC-015
**Endpoint:** PUT /api/users/:id
**Authentication:** Required (Admin)

**URL Parameter:**
```
id=1
```

**Request Body:**
```json
{
  "userRole": "admin"
}
```

**Expected Result:**
- Status Code: 200 OK
- User role updated to admin
- Other fields unchanged

---

## Test Case 16: Delete User - Valid Request

**Test ID:** TC-016
**Endpoint:** DELETE /api/users/:id
**Authentication:** Required (Admin)

**URL Parameter:**
```
id=1
```

**Expected Result:**
- Status Code: 200 OK
- User marked as inactive (soft delete)
- User can still be retrieved but status is "inactive"

**cURL Command:**
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Test Case 17: Delete User - Invalid ID

**Test ID:** TC-017
**Endpoint:** DELETE /api/users/:id
**Authentication:** Required (Admin)

**URL Parameter:**
```
id=999
```

**Expected Result:**
- Status Code: 404 Not Found
- Error message about user not found

---

## Test Case 18: User Login - Valid Credentials

**Test ID:** TC-018
**Endpoint:** POST /api/auth/login
**Authentication:** Not required

**Request Body:**
```json
{
  "loginID": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Result:**
- Status Code: 200 OK
- User data returned (without password)
- JWT token provided (if applicable)

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## Test Case 19: User Login - Invalid Password

**Test ID:** TC-019
**Endpoint:** POST /api/auth/login
**Authentication:** Not required

**Request Body:**
```json
{
  "loginID": "john.doe@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Result:**
- Status Code: 401 Unauthorized
- Error message about invalid password

---

## Test Case 20: User Login - Non-existent User

**Test ID:** TC-020
**Endpoint:** POST /api/auth/login
**Authentication:** Not required

**Request Body:**
```json
{
  "loginID": "nonexistent@example.com",
  "password": "Password123!"
}
```

**Expected Result:**
- Status Code: 401 Unauthorized
- Error message about user not found

---

## Test Case 21: Create Multiple Users

**Test ID:** TC-021
**Endpoint:** POST /api/users
**Authentication:** Required (Admin)

**Objective:** Create 5 different users with different roles

**Test Data:**
```json
[
  {
    "loginID": "admin1@example.com",
    "password": "AdminPassword123!",
    "userRole": "admin",
    "status": "active"
  },
  {
    "loginID": "user1@example.com",
    "password": "UserPassword123!",
    "userRole": "user",
    "status": "active"
  },
  {
    "loginID": "student1@example.com",
    "password": "StudentPassword123!",
    "userRole": "student",
    "status": "active"
  },
  {
    "loginID": "user2@example.com",
    "password": "UserPassword456!",
    "userRole": "user",
    "status": "active"
  },
  {
    "loginID": "student2@example.com",
    "password": "StudentPassword456!",
    "userRole": "student",
    "status": "active"
  }
]
```

**Expected Result:**
- All 5 users created successfully
- Each user has unique ID
- Passwords are hashed
- Roles are correctly assigned

---

## Test Case 22: Pagination Test

**Test ID:** TC-022
**Endpoint:** GET /api/users
**Authentication:** Required (Admin)

**Objective:** Test pagination with multiple pages

**Query Parameters:**
```
limit=2
page=1
```

**Expected Result:**
- Status Code: 200 OK
- Response contains 2 users
- Pagination shows nextPage: 2

**Then test page 2:**
```
limit=2
page=2
```

**Expected Result:**
- Status Code: 200 OK
- Response contains next 2 users
- Pagination shows previousPage: 1

---

## Test Case 23: Sorting Test

**Test ID:** TC-023
**Endpoint:** GET /api/users
**Authentication:** Required (Admin)

**Query Parameters:**
```
sort_by=id
sort_order=asc
limit=10
page=1
```

**Expected Result:**
- Status Code: 200 OK
- Users sorted by ID in ascending order

---

## Test Case 24: Combined Filters Test

**Test ID:** TC-024
**Endpoint:** GET /api/users
**Authentication:** Required (Admin)

**Query Parameters:**
```
status=active
userRole=user
limit=10
page=1
```

**Expected Result:**
- Status Code: 200 OK
- Response contains only active users with "user" role

---

## Test Case 25: Password Strength Validation

**Test ID:** TC-025
**Endpoint:** POST /api/users
**Authentication:** Required (Admin)

**Objective:** Test all password validation rules

**Test Cases:**
1. Too short: `Pass123!` (7 chars) - Should fail
2. No uppercase: `password123!` - Should fail
3. No lowercase: `PASSWORD123!` - Should fail
4. No number: `Password!` - Should fail
5. No special char: `Password123` - Should fail
6. Valid: `SecurePassword123!` - Should pass

**Expected Result:**
- Invalid passwords rejected with appropriate error messages
- Valid password accepted

---

## Test Execution Checklist

- [ ] TC-001: Create User - Valid Request
- [ ] TC-002: Create User - Invalid Password (Too Short)
- [ ] TC-003: Create User - Invalid Password (No Uppercase)
- [ ] TC-004: Create User - Invalid Password (No Special Character)
- [ ] TC-005: Create User - Missing Required Field
- [ ] TC-006: Create User - Unauthorized (No Admin)
- [ ] TC-007: List Users - Valid Request
- [ ] TC-008: List Users - Filter by Status
- [ ] TC-009: List Users - Filter by Role
- [ ] TC-010: List Users - Search by Keyword
- [ ] TC-011: Get User by ID - Valid Request
- [ ] TC-012: Get User by ID - Invalid ID
- [ ] TC-013: Update User - Valid Request
- [ ] TC-014: Update User - Invalid Password
- [ ] TC-015: Update User - Change Role
- [ ] TC-016: Delete User - Valid Request
- [ ] TC-017: Delete User - Invalid ID
- [ ] TC-018: User Login - Valid Credentials
- [ ] TC-019: User Login - Invalid Password
- [ ] TC-020: User Login - Non-existent User
- [ ] TC-021: Create Multiple Users
- [ ] TC-022: Pagination Test
- [ ] TC-023: Sorting Test
- [ ] TC-024: Combined Filters Test
- [ ] TC-025: Password Strength Validation

---

## Notes

- All tests should be executed in order
- Each test should be independent
- Use fresh test data for each test
- Document any failures with error messages
- Verify response status codes and data structure
- Check that passwords are never returned in responses