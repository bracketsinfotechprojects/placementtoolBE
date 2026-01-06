# Fix Password Encryption - Step by Step

## Problem
Passwords are still showing as plain text in the database instead of being encrypted.

## Root Cause
The TypeScript code has been updated with password encryption, but the compiled JavaScript hasn't been rebuilt. You need to recompile the TypeScript code.

---

## Solution

### Step 1: Stop the Running Server
Press `Ctrl+C` in your terminal to stop the running Node.js server.

### Step 2: Clean Build Directory
```bash
npm run prebuild
```

This removes the old compiled code.

### Step 3: Rebuild TypeScript
```bash
npm run build
```

This compiles all TypeScript files to JavaScript with the password encryption code.

### Step 4: Start the Server
```bash
npm run serve
```

Or for development with auto-reload:
```bash
npm run dev
```

---

## Verification Steps

### Step 1: Create a Test User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "testuser@example.com",
    "password": "TestPassword123!",
    "userRole": "user",
    "status": "active"
  }'
```

### Step 2: Check Database
Run this SQL query to verify the password is encrypted:

```sql
SELECT id, loginID, password FROM users WHERE loginID = 'testuser@example.com';
```

**Expected Result:**
- Password should look like: `$2b$12$...` (bcrypt hash)
- NOT plain text like: `TestPassword123!`

### Step 3: Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginID": "testuser@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Result:**
- Login should succeed
- User data returned (without password)

---

## Complete Rebuild Process

If the above doesn't work, do a complete rebuild:

```bash
# 1. Stop the server
# Press Ctrl+C

# 2. Remove node_modules and dist
rm -rf dist node_modules

# 3. Reinstall dependencies
npm install

# 4. Build
npm run build

# 5. Start
npm run serve
```

---

## Troubleshooting

### Issue: "bcrypt not found" error
**Solution:** Reinstall dependencies
```bash
npm install
npm run build
npm run serve
```

### Issue: Still seeing plain text passwords
**Solution:** 
1. Verify the build completed successfully
2. Check that `dist/services/user/user.service.js` contains bcrypt code
3. Restart the server completely

### Issue: Build fails with TypeScript errors
**Solution:**
1. Check for syntax errors in modified files
2. Run `npm run build` again
3. Check the error messages carefully

---

## Verify Build Succeeded

Check if the compiled file contains bcrypt:

```bash
grep -i "bcrypt" dist/services/user/user.service.js
```

If you see output with bcrypt references, the build was successful.

---

## Database Migration (Optional)

If you have existing users with plain text passwords, migrate them:

```bash
node migrate-existing-passwords.js
```

This will:
- Detect plain text passwords
- Hash them with bcrypt
- Update the database
- Provide a summary

---

## Quick Checklist

- [ ] Stopped the running server
- [ ] Ran `npm run prebuild`
- [ ] Ran `npm run build`
- [ ] Started the server with `npm run serve`
- [ ] Created a test user
- [ ] Verified password is hashed in database (starts with `$2b$12$`)
- [ ] Tested login with the new user
- [ ] Migrated existing passwords (if applicable)

---

## Expected Password Format

### Before (Plain Text - WRONG)
```
password: TestPassword123!
```

### After (Bcrypt Hash - CORRECT)
```
password: $2b$12$gKpS4DOhAmnhnoBKiTp2cusPZ5QrPe5zF0JhSfsTcHqU4.AngeRIu
```

The hash will be different each time because bcrypt uses a unique salt for each password.

---

## Still Not Working?

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be v12 or higher

2. **Check npm version:**
   ```bash
   npm --version
   ```
   Should be v6 or higher

3. **Verify bcrypt is installed:**
   ```bash
   npm list bcrypt
   ```
   Should show `bcrypt@5.1.1`

4. **Check TypeScript compilation:**
   ```bash
   npm run build
   ```
   Should complete without errors

5. **Check server logs:**
   Look for any error messages when starting the server

---

## Support

If you're still having issues:
1. Check the server console for error messages
2. Verify the database connection is working
3. Ensure all files were properly updated
4. Try a complete rebuild as shown above

---

## Summary

The password encryption code is already in place. You just need to:
1. **Rebuild** the TypeScript code: `npm run build`
2. **Restart** the server: `npm run serve`
3. **Verify** by creating a test user and checking the database

That's it! Passwords will now be encrypted with bcrypt.