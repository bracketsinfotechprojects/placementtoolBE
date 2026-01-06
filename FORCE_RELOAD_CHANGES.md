# Force Reload Changes - Complete Fix

## Problem
`npm run dev` is running but new code changes are not being reflected.

## Root Causes
1. Nodemon cache not cleared
2. TypeScript compilation cache
3. Node.js module cache
4. Files not properly saved

---

## Solution - Step by Step

### Step 1: Stop the Server Completely
Press `Ctrl+C` multiple times to ensure the server is fully stopped.

Wait 5 seconds to ensure all processes are terminated.

---

### Step 2: Clear All Caches

#### On Windows (CMD):
```bash
rmdir /s /q node_modules\.cache
del /s /q dist\*
```

#### On Windows (PowerShell):
```powershell
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue
```

#### On Mac/Linux:
```bash
rm -rf node_modules/.cache
rm -rf dist/*
```

---

### Step 3: Verify Files Are Saved

Check that your modified files exist and contain the correct code:

```bash
# Check password utility exists
type src\utilities\password.utility.ts

# Check user service has bcrypt import
findstr /i "bcrypt" src\services\user\user.service.ts

# Check user entity has password utility import
findstr /i "PasswordUtility" src\entities\user\user.entity.ts
```

---

### Step 4: Restart with Fresh Build

```bash
# Kill any lingering processes
taskkill /F /IM node.exe

# Wait 2 seconds
timeout /t 2

# Start fresh
npm run dev
```

---

## Alternative: Complete Clean Rebuild

If the above doesn't work, do this:

```bash
# 1. Stop the server (Ctrl+C)

# 2. Remove everything
rmdir /s /q dist
rmdir /s /q node_modules

# 3. Reinstall
npm install

# 4. Start fresh
npm run dev
```

---

## Verify Changes Are Applied

### Check 1: Create a Test User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "test123@example.com",
    "password": "TestPassword123!",
    "userRole": "user",
    "status": "active"
  }'
```

### Check 2: Query Database
```sql
SELECT id, loginID, password FROM users WHERE loginID = 'test123@example.com';
```

**Expected:** Password starts with `$2b$12$` (bcrypt hash)
**Wrong:** Password is plain text like `TestPassword123!`

### Check 3: Check Server Logs
When you create a user, you should see in the console:
```
📝 Creating user with data: { loginID: 'test123@example.com', roleID: 2, status: 'active', passwordHashed: true }
✅ User created successfully with ID: X
```

If you see `passwordHashed: true`, the code is working!

---

## Debugging: Check What's Actually Running

### Check if bcrypt is being used:

Add this temporary debug code to `src/services/user/user.service.ts` at the top:

```typescript
console.log('🔍 USER SERVICE LOADED - Checking imports...');
console.log('PasswordUtility:', typeof PasswordUtility);
console.log('PasswordUtility.hashPassword:', typeof PasswordUtility.hashPassword);
```

When you restart, you should see these logs in the console.

---

## Windows-Specific Fix

If you're on Windows and still having issues:

### Option 1: Use PowerShell Instead of CMD
```powershell
npm run dev
```

### Option 2: Kill All Node Processes
```powershell
Get-Process node | Stop-Process -Force
Start-Sleep -Seconds 2
npm run dev
```

### Option 3: Use Different Port
```bash
PORT=3001 npm run dev
```

---

## Check Nodemon is Working

Verify nodemon is actually watching files:

```bash
npm run dev
```

You should see output like:
```
[nodemon] 2.0.6
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): src
[nodemon] watching extensions: ts
[nodemon] starting `ts-node ./src/index.ts`
```

If you don't see this, nodemon isn't running properly.

---

## Force Nodemon to Restart

While `npm run dev` is running, type `rs` and press Enter:

```
[nodemon] restarting due to changes...
[nodemon] starting `ts-node ./src/index.ts`
```

This forces a restart without stopping the process.

---

## Check TypeScript Compilation

Verify TypeScript is compiling correctly:

```bash
npx tsc --version
```

Should show version 4.9.5 or higher.

---

## Complete Step-by-Step Process

Follow this EXACTLY:

1. **Stop server** - Press `Ctrl+C` multiple times
2. **Wait 5 seconds**
3. **Clear cache:**
   ```bash
   rmdir /s /q dist
   ```
4. **Kill node processes:**
   ```bash
   taskkill /F /IM node.exe
   ```
5. **Wait 2 seconds**
6. **Start fresh:**
   ```bash
   npm run dev
   ```
7. **Wait for server to start** - Look for "listening on port 3000"
8. **Test with curl** - Create a user and check database

---

## Verify Each File Has Changes

### 1. Check password.utility.ts
```bash
findstr /i "hashPassword" src\utilities\password.utility.ts
```
Should show the hashPassword method.

### 2. Check user.service.ts
```bash
findstr /i "PasswordUtility.hashPassword" src\services\user\user.service.ts
```
Should show password hashing being called.

### 3. Check user.entity.ts
```bash
findstr /i "PasswordUtility" src\entities\user\user.entity.ts
```
Should show PasswordUtility import.

---

## If Still Not Working

### Check 1: Verify bcrypt is installed
```bash
npm list bcrypt
```
Should show: `bcrypt@5.1.1`

If not:
```bash
npm install bcrypt@5.1.1
npm run dev
```

### Check 2: Verify TypeScript types
```bash
npm list @types/bcrypt
```
Should show: `@types/bcrypt@5.0.0`

If not:
```bash
npm install --save-dev @types/bcrypt@5.0.0
npm run dev
```

### Check 3: Check for syntax errors
```bash
npx tsc --noEmit
```
Should complete without errors.

---

## Nuclear Option: Complete Fresh Start

If nothing else works:

```bash
# 1. Stop server (Ctrl+C)

# 2. Delete everything
rmdir /s /q dist
rmdir /s /q node_modules
del package-lock.json

# 3. Reinstall everything
npm install

# 4. Start
npm run dev
```

---

## Expected Console Output

When you start `npm run dev`, you should see:

```
[nodemon] 2.0.6
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): src
[nodemon] watching extensions: ts
[nodemon] starting `ts-node ./src/index.ts`
🔍 USER SERVICE LOADED - Checking imports...
PasswordUtility: function
PasswordUtility.hashPassword: function
✅ Server listening on port 3000
```

If you see `PasswordUtility: function`, the code is loaded correctly!

---

## Test After Fix

### Create User:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "verify@example.com",
    "password": "VerifyPassword123!",
    "userRole": "user",
    "status": "active"
  }'
```

### Check Database:
```sql
SELECT password FROM users WHERE loginID = 'verify@example.com';
```

**Should show:** `$2b$12$...` (bcrypt hash)
**NOT:** `VerifyPassword123!` (plain text)

---

## Checklist

- [ ] Stopped the server completely
- [ ] Cleared dist directory
- [ ] Killed all node processes
- [ ] Verified files have the changes
- [ ] Started with `npm run dev`
- [ ] Saw "listening on port 3000"
- [ ] Created a test user
- [ ] Checked database - password is hashed
- [ ] Tested login - works correctly

---

## Still Having Issues?

1. **Check server console** - Look for error messages
2. **Check database** - Verify connection is working
3. **Check file permissions** - Ensure files are readable
4. **Check disk space** - Ensure enough space for compilation
5. **Restart computer** - Sometimes helps with process locks

---

## Summary

The most common fix is:
1. Stop the server
2. Delete the `dist` folder
3. Kill all node processes
4. Start with `npm run dev`

That's it! The new code should now be reflected.