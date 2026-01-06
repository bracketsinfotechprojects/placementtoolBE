# Server Must Be Running First!

## ⚠️ You Cannot Test API Without Starting Server

**The 404 error in Postman means the server is not running.**

## **SOLUTION: Start Your Server First**

### Step 1: Open Terminal/Command Prompt
Navigate to your project folder: `d:/Rakesh/CRM`

### Step 2: Install Dependencies (if needed)
```bash
npm install
```

### Step 3: Compile TypeScript
```bash
npm run build
```

### Step 4: Start Server
```bash
npm start
```

### Step 5: Wait for This Message
```
Server running at 5555
```

### Step 6: Then Test in Postman

**Postman Configuration:**
- **Method:** POST
- **URL:** `http://localhost:5555/api/students`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
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
}
```

## **If You Still Get 404 After Starting Server:**

### Check These:

1. **Port Number:**
   - Your `.env` file shows: `PORT=5555`
   - Use: `http://localhost:5555/api/students`
   - NOT port 3000!

2. **Server Console Output:**
   You should see:
   ```
   Database connection successful
   Server running at 5555
   ```

3. **Test Server First:**
   ```bash
   curl http://localhost:5555/api/students
   ```
   This should return JSON (even if empty array)

## **Quick Test Sequence:**
1. ✅ `npm install`
2. ✅ `npm run build`
3. ✅ `npm start`
4. ✅ See "Server running at 5555"
5. ✅ Test with Postman

## **Expected Postman Response:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "student_id": 123,
    "first_name": "Jane",
    "last_name": "Smith",
    // ... complete student data
  }
}
```

## **If Server Won't Start:**
- Check MySQL is running
- Check database credentials in `.env`
- Check for compilation errors in `npm run build`

**The 404 error will be gone once your server is running!** 🚀