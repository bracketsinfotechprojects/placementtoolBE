# User API - Quick Reference Guide

## Quick Start

### Create a New User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "user@example.com",
    "password": "SecurePass123!",
    "userRole": "user",
    "status": "active"
  }'
```

### List Users
```bash
curl -X GET "http://localhost:3000/api/users?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User by ID
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePass123!",
    "status": "active"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users` | Create new user | Admin |
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| POST | `/api/auth/login` | User login | No |

---

## Password Requirements

✅ **Valid Password Example:** `SecurePass123!`

Password must have:
- ✓ Minimum 8 characters
- ✓ At least one UPPERCASE letter
- ✓ At least one lowercase letter
- ✓ At least one number (0-9)
- ✓ At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

❌ **Invalid Examples:**
- `password123` - No uppercase, no special char
- `Pass123` - Too short, no special char
- `PASSWORD123!` - No lowercase
- `Pass!` - Too short

---

## Response Format

### Success Response
```json
{
  "data": { /* resource data */ },
  "success": true,
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description"
  },
  "success": false
}
```

---

## Common Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Server Error

---

## JavaScript Example

```javascript
// Create user
async function createUser(token) {
  const response = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      loginID: 'user@example.com',
      password: 'SecurePass123!',
      userRole: 'user',
      status: 'active'
    })
  });
  
  const data = await response.json();
  console.log(data);
}

// List users
async function listUsers(token) {
  const response = await fetch('http://localhost:3000/api/users?limit=10&page=1', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data);
}
```

---

## Python Example

```python
import requests

# Create user
def create_user(token):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {
        'loginID': 'user@example.com',
        'password': 'SecurePass123!',
        'userRole': 'user',
        'status': 'active'
    }
    
    response = requests.post(
        'http://localhost:3000/api/users',
        headers=headers,
        json=data
    )
    print(response.json())

# List users
def list_users(token):
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.get(
        'http://localhost:3000/api/users?limit=10&page=1',
        headers=headers
    )
    print(response.json())
```

---

## Query Parameters

### List Users Filters
```
?keyword=john              # Search by loginID or ID
?status=active             # Filter by status
?userRole=admin            # Filter by role
?limit=20                  # Items per page
?page=1                    # Page number
?sort_by=id                # Sort field
?sort_order=desc           # Sort order (asc/desc)
```

### Example
```
GET /api/users?status=active&userRole=user&limit=10&page=1
```

---

## User Roles

- `admin` - Administrator with full access
- `user` - Regular user
- `student` - Student user

---

## User Status

- `active` - User account is active
- `inactive` - User account is inactive (soft deleted)

---

## Important Notes

⚠️ **Security:**
- Always use HTTPS in production
- Never expose JWT tokens in logs
- Passwords are hashed with bcrypt (12 salt rounds)
- Passwords are never returned in API responses

⚠️ **Admin Only:**
- Create user endpoint requires admin authentication
- Update user endpoint requires admin authentication
- Delete user endpoint requires admin authentication
- List users endpoint requires admin authentication

⚠️ **Password Hashing:**
- Passwords are automatically hashed before storage
- Original passwords cannot be recovered
- Password verification uses secure comparison

---

## Troubleshooting

**Q: Getting "Unauthorized access" error?**
A: Ensure you have a valid JWT token and admin role

**Q: Password validation failing?**
A: Check password meets all requirements (8+ chars, uppercase, lowercase, number, special char)

**Q: User not found?**
A: Verify the user ID is correct and user hasn't been deleted

**Q: Getting 500 error?**
A: Check server logs for detailed error information

---

## Related Documentation

- [Full API Documentation](./USER_API_DOCUMENTATION.md)
- [Password Encryption Guide](./PASSWORD_ENCRYPTION_GUIDE.md)
- [User Service Implementation](./src/services/user/user.service.ts)