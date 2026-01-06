# SQL Procedure Testing Guide

This guide explains how to test the SQL procedures for creating students with user accounts.

## Prerequisites

- MySQL/MariaDB database with the Student CRM schema
- Node.js environment with the following packages:
  - `mysql2`
  - `dotenv`

## Setup

1. **Install Dependencies**
   ```bash
   npm install mysql2 dotenv
   ```

2. **Configure Database Connection**
   Ensure your `.env` file contains:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=student_crm
   DB_PORT=3306
   ```

3. **Load SQL Procedures**
   First, ensure the SQL procedures are loaded:
   ```bash
   mysql -u root -p student_crm < create-student-user-procedure.sql
   ```

## Running Tests

### Quick Test Run
```bash
node test-sql-procedure.js
```

### Expected Output
The test script will:
1. ✅ Connect to the database
2. ✅ Load the SQL procedures
3. ✅ Test single student creation
4. ✅ Test bulk student creation
5. ✅ Test sync existing students
6. ✅ Test error handling
7. ✅ Clean up test data
8. 📊 Show test summary

## Test Coverage

### 1. Single Student Creation Test
- Creates a student using `CreateStudentWithUserAccount`
- Verifies student record in `students` table
- Verifies user account in `users` table
- Verifies role assignment in `user_roles` table

### 2. Bulk Creation Test
- Creates multiple students using `CreateStudentUserBulk`
- Validates JSON data parsing
- Verifies all bulk-created records

### 3. Sync Existing Students Test
- Creates a manual student record (without user)
- Runs `SyncExistingStudentsWithUsers` procedure
- Verifies user account creation for existing student
- Cleans up test data

### 4. Error Handling Test
- Tests duplicate email handling
- Tests validation error handling
- Verifies proper error messages

## Test Data Used

The test uses sample student data:
- **Alice Johnson**: Graduate student, Canadian, University of Toronto
- **Bob Smith**: Undergraduate student, American, State University
- **Carol Davis**: Graduate student, British, Graduate University

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Ensure MySQL service is running
   - Verify database exists

2. **Procedure Not Found**
   - Load the SQL procedures first
   - Check procedure names match exactly

3. **Foreign Key Constraints**
   - Ensure all required tables exist
   - Check foreign key relationships
   - Verify role data in `roles` table

4. **Permission Denied**
   - Ensure database user has required permissions
   - Check stored procedure execution rights

### Manual Verification

If automated tests fail, you can manually verify:

```sql
-- Check created students
SELECT * FROM students WHERE created_at > NOW() - INTERVAL 1 HOUR;

-- Check created users
SELECT * FROM users WHERE created_at > NOW() - INTERVAL 1 HOUR;

-- Check role assignments
SELECT u.loginID, r.role_name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.role_id 
WHERE u.created_at > NOW() - INTERVAL 1 HOUR;
```

## Test Results

After running tests, you'll see:
- ✅ PASS: Test completed successfully
- ❌ FAIL: Test failed with error details
- 📊 Summary: Total tests passed/failed

### Success Criteria
- All tests should PASS
- Test data should be cleaned up automatically
- No database errors should occur

## Integration with CI/CD

For automated testing in CI/CD pipelines:

```bash
# Run tests in CI environment
node test-sql-procedure.js

# Check exit code
if [ $? -eq 0 ]; then
    echo "All tests passed"
    exit 0
else
    echo "Tests failed"
    exit 1
fi
```

## Performance Testing

For performance testing with larger datasets:

```bash
# Modify test script to create more test students
const TEST_STUDENTS = Array.from({length: 100}, (_, i) => ({
    first_name: `Student${i}`,
    last_name: 'Test',
    email: `student${i}@test.edu`,
    // ... other fields
}));
```

## Cleanup

The test script automatically cleans up test data, but you can also manually clean:

```sql
-- Delete test users
DELETE FROM user_roles WHERE user_id IN (
    SELECT id FROM users WHERE loginID LIKE '%test%' OR loginID LIKE '%@test.edu'
);

DELETE FROM users WHERE loginID LIKE '%test%' OR loginID LIKE '%@test.edu';

-- Delete test students
DELETE FROM contact_details WHERE email LIKE '%test%';
DELETE FROM students WHERE first_name LIKE '%Test%' OR first_name LIKE '%Student%';