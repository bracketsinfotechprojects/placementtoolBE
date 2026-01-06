# cURL Commands Reference - User API

## Setup

Replace these placeholders in all commands:
- `YOUR_JWT_TOKEN` - Your JWT authentication token
- `localhost:3000` - Your server URL
- `1` - User ID (where applicable)

---

## 1. User Login (Get JWT Token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "admin@example.com",
    "password": "AdminPassword123!"
  }'
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "loginID": "admin@example.com",
    "roleID": 1,
    "status": "active"
  },
  "success": true,
  "message": "Login successful"
}
```

---

## 2. Create New User

### Basic Create
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

### Create Admin User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "admin.user@example.com",
    "password": "AdminPassword123!",
    "userRole": "admin",
    "status": "active"
  }'
```

### Create Student User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "student@example.com",
    "password": "StudentPassword123!",
    "userRole": "student",
    "status": "active"
  }'
```

### Create Inactive User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "inactive.user@example.com",
    "password": "SecurePassword123!",
    "userRole": "user",
    "status": "inactive"
  }'
```

---

## 3. List Users

### List All Users (Default Pagination)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List with Custom Limit and Page
```bash
curl -X GET "http://localhost:3000/api/users?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Active Users Only
```bash
curl -X GET "http://localhost:3000/api/users?status=active&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Inactive Users Only
```bash
curl -X GET "http://localhost:3000/api/users?status=inactive&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Admin Users Only
```bash
curl -X GET "http://localhost:3000/api/users?userRole=admin&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Regular Users Only
```bash
curl -X GET "http://localhost:3000/api/users?userRole=user&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Student Users Only
```bash
curl -X GET "http://localhost:3000/api/users?userRole=student&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search Users by Keyword
```bash
curl -X GET "http://localhost:3000/api/users?keyword=john&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:3000/api/users?status=active&userRole=user&keyword=john&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Sort by ID Ascending
```bash
curl -X GET "http://localhost:3000/api/users?sort_by=id&sort_order=asc&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Sort by ID Descending
```bash
curl -X GET "http://localhost:3000/api/users?sort_by=id&sort_order=desc&limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Second Page (20 items per page)
```bash
curl -X GET "http://localhost:3000/api/users?limit=20&page=2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Get User by ID

### Get Specific User
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User 2
```bash
curl -X GET http://localhost:3000/api/users/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User 5
```bash
curl -X GET http://localhost:3000/api/users/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Update User

### Update Password Only
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecurePassword123!"
  }'
```

### Update Status Only
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

### Update Role Only
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userRole": "admin"
  }'
```

### Update Login ID Only
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "newemail@example.com"
  }'
```

### Update Multiple Fields
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "updated@example.com",
    "password": "NewSecurePassword123!",
    "userRole": "admin",
    "status": "active"
  }'
```

### Promote User to Admin
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userRole": "admin"
  }'
```

### Demote Admin to User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userRole": "user"
  }'
```

### Deactivate User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

### Reactivate User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

---

## 6. Delete User

### Delete User (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete User 2
```bash
curl -X DELETE http://localhost:3000/api/users/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete User 5
```bash
curl -X DELETE http://localhost:3000/api/users/5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Error Test Cases

### Test Invalid Password (Too Short)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "test@example.com",
    "password": "Pass123!",
    "userRole": "user",
    "status": "active"
  }'
```

### Test Invalid Password (No Uppercase)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "test@example.com",
    "password": "password123!",
    "userRole": "user",
    "status": "active"
  }'
```

### Test Invalid Password (No Special Character)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "test@example.com",
    "password": "Password123",
    "userRole": "user",
    "status": "active"
  }'
```

### Test Missing Password
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "test@example.com",
    "userRole": "user",
    "status": "active"
  }'
```

### Test Missing Login ID
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePassword123!",
    "userRole": "user",
    "status": "active"
  }'
```

### Test Invalid User ID
```bash
curl -X GET http://localhost:3000/api/users/999 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Without Authorization
```bash
curl -X GET http://localhost:3000/api/users
```

---

## 8. Batch Operations

### Create 3 Users (Run Sequentially)
```bash
# User 1
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "user1@example.com",
    "password": "SecurePassword123!",
    "userRole": "user",
    "status": "active"
  }'

# User 2
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "user2@example.com",
    "password": "SecurePassword456!",
    "userRole": "user",
    "status": "active"
  }'

# User 3
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "user3@example.com",
    "password": "SecurePassword789!",
    "userRole": "student",
    "status": "active"
  }'
```

---

## 9. Advanced Queries

### Get All Active Admin Users
```bash
curl -X GET "http://localhost:3000/api/users?status=active&userRole=admin&limit=50&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Inactive Users
```bash
curl -X GET "http://localhost:3000/api/users?status=inactive&limit=50&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search for Users with "john" in Login ID
```bash
curl -X GET "http://localhost:3000/api/users?keyword=john&limit=50&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Students, Sorted by ID
```bash
curl -X GET "http://localhost:3000/api/users?userRole=student&sort_by=id&sort_order=asc&limit=50&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get First 5 Users
```bash
curl -X GET "http://localhost:3000/api/users?limit=5&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Users 6-10
```bash
curl -X GET "http://localhost:3000/api/users?limit=5&page=2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 10. Save Response to File

### Save User List to File
```bash
curl -X GET "http://localhost:3000/api/users?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o users_list.json
```

### Save Single User to File
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o user_1.json
```

### Save with Pretty Print
```bash
curl -X GET "http://localhost:3000/api/users?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq . > users_list.json
```

---

## 11. Verbose Output

### Show Request and Response Headers
```bash
curl -v -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Show Only Response Headers
```bash
curl -i -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 12. Quick Test Script

Save as `test_api.sh`:

```bash
#!/bin/bash

# Set your JWT token
JWT_TOKEN="YOUR_JWT_TOKEN"
BASE_URL="http://localhost:3000/api"

echo "=== Testing User API ==="

# Test 1: Create User
echo -e "\n1. Creating user..."
curl -X POST $BASE_URL/users \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "test@example.com",
    "password": "TestPassword123!",
    "userRole": "user",
    "status": "active"
  }'

# Test 2: List Users
echo -e "\n\n2. Listing users..."
curl -X GET "$BASE_URL/users?limit=5&page=1" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Test 3: Get User
echo -e "\n\n3. Getting user 1..."
curl -X GET $BASE_URL/users/1 \
  -H "Authorization: Bearer $JWT_TOKEN"

# Test 4: Update User
echo -e "\n\n4. Updating user 1..."
curl -X PUT $BASE_URL/users/1 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'

# Test 5: Delete User
echo -e "\n\n5. Deleting user 1..."
curl -X DELETE $BASE_URL/users/1 \
  -H "Authorization: Bearer $JWT_TOKEN"

echo -e "\n\n=== Tests Complete ==="
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## 13. Common Patterns

### Check if User Exists
```bash
curl -s -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | grep -q '"id":1' && echo "User exists" || echo "User not found"
```

### Count Total Users
```bash
curl -s -X GET "http://localhost:3000/api/users?limit=1&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.pagination.totalItems'
```

### Get Last Page
```bash
curl -s -X GET "http://localhost:3000/api/users?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.pagination.totalPages'
```

---

## 14. Windows PowerShell Equivalents

### Create User (PowerShell)
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    loginID = "john@example.com"
    password = "SecurePassword123!"
    userRole = "user"
    status = "active"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/users" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

### List Users (PowerShell)
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/users?limit=10&page=1" `
  -Method GET `
  -Headers $headers
```

---

## Tips & Tricks

1. **Save JWT Token to Variable:**
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"loginID":"admin@example.com","password":"AdminPassword123!"}' | jq -r '.data.token')
   ```

2. **Use Token in Subsequent Requests:**
   ```bash
   curl -X GET http://localhost:3000/api/users \
     -H "Authorization: Bearer $TOKEN"
   ```

3. **Pretty Print JSON Response:**
   ```bash
   curl -s -X GET http://localhost:3000/api/users/1 \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq .
   ```

4. **Extract Specific Field:**
   ```bash
   curl -s -X GET http://localhost:3000/api/users/1 \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.data.loginID'
   ```

5. **Check Response Status Code:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:3000/api/users/1 \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

---

## Common Status Codes

- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not admin)
- `404` - Not Found (user doesn't exist)
- `500` - Server Error

---

## Password Requirements Reminder

All passwords must have:
- ✓ 8-128 characters
- ✓ At least one UPPERCASE letter
- ✓ At least one lowercase letter
- ✓ At least one number (0-9)
- ✓ At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Valid Example:** `SecurePassword123!`