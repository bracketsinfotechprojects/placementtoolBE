# Debug User Creation Issue

## Why Users Are Not Being Created

I've added debugging to help identify the issue. Here's how to debug:

## Step 1: Restart Your Server

**After making the code changes, restart your server:**
```bash
npm run build
npm start
```

## Step 2: Check Console Logs

When you create a student, look for these log messages in your server console:

### Expected Logs:
```
📧 Email extracted from contact_details: alex.johnson@student.edu
📝 Student creation request data: {...}
📝 Student data prepared for service: {...}
🔧 Attempting to create user account for email: alex.johnson@student.edu
📝 User data to create: {...}
✅ User account created successfully: {...}
```

### If You See These Logs:
- ⚠️ No email found in contact_details → Email not being sent properly
- ⚠️ No email provided in student creation → Email extraction failed
- ❌ Failed to create user account → UserService issue

## Step 3: Test UserService Directly

**Create a simple test file and run it:**
```bash
# After building the project
node test-user-service-direct.js
```

This will test if UserService works independently.

## Step 4: Check Database Tables

**Verify these tables exist:**
```sql
-- Check if users table exists
DESCRIBE users;

-- Check if any users exist
SELECT * FROM users LIMIT 5;
```

## Step 5: Manual User Creation Test

**Test user creation directly in database:**
```sql
INSERT INTO users (loginID, password, userRole, status) 
VALUES ('test@example.com', 'test123', 'student', 'active');

SELECT * FROM users WHERE loginID = 'test@example.com';
```

## Step 6: Check for Common Issues

### Issue 1: Compilation Errors
```bash
npm run build
```
Look for TypeScript compilation errors.

### Issue 2: Database Connection
Check if your `.env` has correct database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Atul@2626
DB_NAME=testCRM
```

### Issue 3: Missing Tables
Run the database setup:
```bash
npm run db:tables
```

### Issue 4: Import Issues
The UserService import might be failing. Check for circular dependencies.

## Step 7: Simplified Debug Test

**Create a minimal test without the full API:**

1. **Start server**
2. **Send this minimal curl:**
```bash
curl -X POST http://localhost:5555/student \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "dob": "1990-01-01",
    "contact_details": {
      "email": "test.debug@example.com"
    }
  }'
```

3. **Watch console for debug messages**

## What the Logs Will Tell You:

### If you see:
- `📧 Email extracted` → Controller is working
- `🔧 Attempting to create` → Service received email
- `❌ Failed to create` → UserService has issues
- No user logs → Email not being passed

### Next Steps Based on Logs:

**No email logs:** Check JSON payload format
**Email found but no user logs:** Check UserService import
**User creation failed:** Check database and UserService implementation

## Quick Fixes:

### If UserService import fails:
```typescript
// Try this alternative import in student.service.ts
import { create } from '../user/user.service';
```

### If database issues:
```bash
# Reset database
npm run db:drop
npm run db:tables
npm run db:seed
```

The debugging logs will show exactly where the process is failing!