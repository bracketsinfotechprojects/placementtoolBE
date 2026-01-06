# User Management API Documentation

## Overview
Complete API documentation for user management endpoints with secure password encryption using bcrypt.

---

## Base URL
```
http://localhost:3000/api/users
```

---

## Authentication
All endpoints (except login) require admin authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Create New User
**Create a new user account with encrypted password**

**Endpoint:** `POST /api/users`

**Authentication:** Required (Admin only)

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "loginID": "john.doe@example.com",
  "password": "SecurePassword123!",
  "userRole": "user",
  "status": "active"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `loginID` | string | Yes | Unique login identifier (email or username) |
| `password` | string | Yes | Password (min 8 chars, must include uppercase, lowercase, number, special char) |
| `userRole` | string | No | User role: `admin`, `user`, or `student` (default: `user`) |
| `status` | string | No | User status: `active` or `inactive` (default: `active`) |

**Password Requirements:**
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Success Response (201 Created):**
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

**Error Response (400 Bad Request):**
```json
{
  "error": {
    "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  },
  "success": false
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": {
    "message": "Unauthorized access"
  },
  "success": false
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "john.doe@example.com",
    "password": "SecurePassword123!",
    "userRole": "user",
    "status": "active"
  }'
```

**Example JavaScript/Node.js:**
```javascript
const axios = require('axios');

const createUser = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/users', {
      loginID: 'john.doe@example.com',
      password: 'SecurePassword123!',
      userRole: 'user',
      status: 'active'
    }, {
      headers: {
        'Authorization': 'Bearer <jwt_token>',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('User created:', response.data);
  } catch (error) {
    console.error('Error creating user:', error.response.data);
  }
};

createUser();
```

**Example Python:**
```python
import requests
import json

url = 'http://localhost:3000/api/users'
headers = {
    'Authorization': 'Bearer <jwt_token>',
    'Content-Type': 'application/json'
}
data = {
    'loginID': 'john.doe@example.com',
    'password': 'SecurePassword123!',
    'userRole': 'user',
    'status': 'active'
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

---

### 2. User Login
**Authenticate user and receive JWT token**

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "loginID": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "loginID": "john.doe@example.com",
    "roleID": 2,
    "status": "active"
  },
  "success": true,
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": {
    "message": "Invalid password"
  },
  "success": false
}
```

---

### 3. Get User by ID
**Retrieve a specific user's information**

**Endpoint:** `GET /api/users/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | User ID |

**Success Response (200 OK):**
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
  "success": true
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 4. List All Users
**Retrieve a paginated list of users with filtering options**

**Endpoint:** `GET /api/users`

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `keyword` | string | Search by loginID or ID |
| `status` | string | Filter by status: `active` or `inactive` |
| `userRole` | string | Filter by role: `admin`, `user`, or `student` |
| `limit` | integer | Items per page (default: 20) |
| `page` | integer | Page number (default: 1) |
| `sort_by` | string | Sort field (default: `id`) |
| `sort_order` | string | Sort order: `asc` or `desc` (default: `desc`) |

**Success Response (200 OK):**
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
    },
    {
      "id": 2,
      "loginID": "jane.smith@example.com",
      "roleID": 3,
      "status": "active",
      "createdAt": "2026-01-05T11:00:00.000Z",
      "updatedAt": "2026-01-05T11:00:00.000Z"
    }
  ],
  "success": true,
  "message": "Users retrieved successfully",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "previousPage": null,
    "nextPage": 2,
    "totalItems": 100
  }
}
```

**Example cURL:**
```bash
curl -X GET "http://localhost:3000/api/users?status=active&limit=10&page=1" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 5. Update User
**Update user information including password**

**Endpoint:** `PUT /api/users/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | User ID |

**Request Body:**
```json
{
  "loginID": "john.doe.updated@example.com",
  "password": "NewSecurePassword123!",
  "userRole": "admin",
  "status": "active"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `loginID` | string | No | New login ID |
| `password` | string | No | New password (must meet strength requirements) |
| `userRole` | string | No | New role: `admin`, `user`, or `student` |
| `status` | string | No | New status: `active` or `inactive` |

**Success Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "loginID": "john.doe.updated@example.com",
    "roleID": 1,
    "status": "active",
    "createdAt": "2026-01-05T10:30:00.000Z",
    "updatedAt": "2026-01-05T12:00:00.000Z"
  },
  "success": true,
  "message": "User updated successfully"
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePassword123!",
    "status": "active"
  }'
```

---

### 6. Delete User (Soft Delete)
**Mark user as inactive (soft delete)**

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | User ID |

**Success Response (200 OK):**
```json
{
  "data": null,
  "success": true,
  "message": "User deleted successfully"
}
```

**Example cURL:**
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <jwt_token>"
```

---

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters or validation failed |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions (not admin) |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Error Handling

### Common Error Responses

**Validation Error:**
```json
{
  "error": {
    "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  },
  "success": false
}
```

**Authentication Error:**
```json
{
  "error": {
    "message": "Unauthorized access"
  },
  "success": false
}
```

**Not Found Error:**
```json
{
  "error": {
    "message": "User not found"
  },
  "success": false
}
```

**Server Error:**
```json
{
  "error": {
    "message": "Internal server error"
  },
  "success": false
}
```

---

## Security Features

### Password Encryption
- All passwords are encrypted using bcrypt with 12 salt rounds
- Passwords are never stored in plain text
- Password verification uses constant-time comparison

### Authentication
- JWT token-based authentication
- Admin-only endpoints protected with middleware
- Passwords excluded from API responses

### Validation
- Strong password requirements enforced
- Input validation on all endpoints
- SQL injection prevention through parameterized queries

---

## Rate Limiting Recommendations

For production environments, implement rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 user creations per hour
  message: 'Too many user creation attempts'
});
```

---

## Testing the API

### Using Postman

1. **Create User Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/users`
   - Headers: 
     - `Authorization: Bearer <jwt_token>`
     - `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "loginID": "test@example.com",
       "password": "TestPassword123!",
       "userRole": "user",
       "status": "active"
     }
     ```

2. **List Users Request:**
   - Method: GET
   - URL: `http://localhost:3000/api/users?limit=10&page=1`
   - Headers:
     - `Authorization: Bearer <jwt_token>`

---

## Best Practices

1. **Always use HTTPS** in production
2. **Never log passwords** in any form
3. **Implement rate limiting** to prevent brute force attacks
4. **Use strong JWT secrets** for token generation
5. **Regularly rotate JWT secrets** for enhanced security
6. **Monitor failed login attempts** for suspicious activity
7. **Implement CORS** properly to prevent unauthorized access
8. **Keep dependencies updated** for security patches

---

## Troubleshooting

### Issue: "Invalid password" error on login
- Ensure password is correct
- Check if user account is active
- Verify user exists in database

### Issue: "Unauthorized access" error
- Verify JWT token is valid and not expired
- Check if user has admin role
- Ensure Authorization header is properly formatted

### Issue: "User not found" error
- Verify user ID is correct
- Check if user was deleted (soft delete)
- Ensure user exists in database

---

## Support

For issues or questions, contact the development team or refer to the main documentation.