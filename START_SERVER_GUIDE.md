# How to Start the Server - Complete Guide

## The 404 Error is Because the Server is Not Running

Your server is a TypeScript application that needs to be compiled and started. Here's how to do it:

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Compile TypeScript
```bash
npm run build
```

## Step 3: Start the Server
```bash
npm start
```

## Alternative: Development Mode (Auto-reload)
```bash
npm run dev
```

## Step 4: Verify Server is Running
Look for this message in the console:
```
Server running at 5555
```

## Step 5: Test the API
Once you see "Server running at 5555", test with:
```bash
curl http://localhost:5555/api/students
```

## Step 6: Create Student with User Account
```bash
curl -X POST http://localhost:5555/api/students \
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

## Expected Server Output:
When you start the server, you should see:
```
[nodemon] starting `node dist/index.js`
Database connection successful
Server running at 5555
```

## If You Get Errors:

### TypeScript Compilation Errors:
```bash
npm run build
```
Fix any TypeScript errors first

### Database Connection Errors:
- Check your `.env` file has correct database credentials
- Ensure MySQL server is running
- Check database exists: `testCRM`

### Port Already in Use:
```bash
# Find process using port 5555
netstat -ano | findstr :5555

# Kill the process (Windows)
taskkill /PID [process_id] /F
```

### Common Issues & Solutions:

| Error | Solution |
|-------|----------|
| `Cannot find module` | Run `npm install` |
| `TypeScript compilation failed` | Fix TypeScript errors, then `npm run build` |
| `Database connection failed` | Check `.env` database credentials |
| `Port 5555 already in use` | Kill existing process or change port |
| `No such file or directory` | Make sure you ran `npm run build` first |

## Quick Start Commands:
```bash
# Complete sequence
npm install
npm run build  
npm start

# Or development mode
npm install
npm run dev
```

## After Server Starts:
1. **Wait for**: "Server running at 5555"
2. **Test**: `curl http://localhost:5555/api/students`
3. **Create Student**: Use the curl command above
4. **Verify**: Check database for user with email as loginID

## Success Indicators:
- ✅ Server console shows "Server running at 5555"
- ✅ `curl http://localhost:5555/api/students` returns JSON (even if empty array)
- ✅ Student creation returns 201 with student data
- ✅ User account created in database automatically

The key issue is that you need to compile the TypeScript and start the server before the API endpoints will respond.