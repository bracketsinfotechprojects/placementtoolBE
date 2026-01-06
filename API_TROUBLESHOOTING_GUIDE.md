# Student API Troubleshooting Guide

## 404 Error - "Not Found" - Solutions

### 1. **Correct API Endpoint**
The student API endpoint is: `/api/students` (with 's')

**Correct Curl Command:**
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
    }
  }'
```

### 2. **Check if Server is Running**

First, test if the server is running:
```bash
# Test basic connectivity
curl http://localhost:3000/api/health

# Or test with students endpoint (GET)
curl http://localhost:3000/api/students

# Check default route
curl http://localhost:3000/
```

### 3. **Check Server Port**

Your server might be running on a different port. Check your `.env` file:

**Check .env file:**
```bash
cat .env
```

Look for the `PORT` setting:
- If `PORT=5555`, use: `http://localhost:5555/api/students`
- If `PORT=3000`, use: `http://localhost:3000/api/students`

### 4. **Start the Server**

If server is not running, start it:

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Using TypeScript compilation:**
```bash
npm run build
npm run start:prod
```

### 5. **Verify Database Connection**

Check if database is accessible:
```bash
node check-db.js
```

### 6. **Alternative Endpoints to Test**

Try these endpoints to verify server is working:

**Health check:**
```bash
curl http://localhost:3000/api/health
```

**List students (GET):**
```bash
curl http://localhost:3000/api/students
```

**Get specific student (GET):**
```bash
curl http://localhost:3000/api/students/1
```

### 7. **Check Server Logs**

When you start the server, look for:
- ✅ Database connection successful
- ✅ Server listening on port X
- ✅ Routes loaded successfully

### 8. **Environment Variables**

Make sure you have a `.env` file with:
```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Atul@2626
DB_NAME=testCRM
PORT=3000
TOKEN_SECRET_KEY=test
```

### 9. **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` | Start the server |
| `404 Not Found` | Check port and endpoint path |
| `Database connection failed` | Check database credentials |
| `Cannot find module` | Run `npm install` |
| `Port already in use` | Change port or kill existing process |

### 10. **Debugging Steps**

1. **Verify server is running:**
   ```bash
   netstat -an | grep :3000
   ```

2. **Check if port 3000 is listening:**
   - Windows: `netstat -an | findstr :3000`
   - Linux/Mac: `netstat -an | grep :3000`

3. **Test with simple GET request first:**
   ```bash
   curl -X GET http://localhost:3000/api/students
   ```

### 11. **If All Else Fails**

**Check package.json scripts:**
```bash
cat package.json | grep -A 10 '"scripts"'
```

**Try different start commands:**
```bash
npm run dev
npm run start
npm run build
node dist/index.js
```

### 12. **Expected Response Format**

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "student_id": 123,
    "first_name": "Jane",
    "last_name": "Smith",
    "full_name": "Jane Smith",
    // ... complete student object
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Validation error message"
  }
}
```

## Quick Test Sequence

1. **Start server:** `npm run dev`
2. **Test connectivity:** `curl http://localhost:3000/api/students`
3. **Create student:** Use the curl command above
4. **Verify user creation:** Check database for user with loginID

This should resolve the 404 error and help you successfully create a student with automatic user account creation.