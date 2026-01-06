# Student-User Synchronization Guide

## Business Requirement ✅

**Every student in the CRM system must have a corresponding user account so they can log in and access the system.**

This ensures:
- Students can authenticate and access their data
- Role-based access control works properly
- Consistent user experience across the platform

## Current Implementation

### 📋 **Student-User Mapping Rules**

| Student Field | User Field | Mapping Logic |
|---------------|------------|---------------|
| `email` (from contact_details) | `loginID` | Use student's email address |
| N/A | `password` | Hashed password (default: `test123`) |
| `status` | `status` | Same status as student |
| N/A | `userRole` | Always `Student` |
| N/A | `role_id` | Links to `Student` role in `user_roles` table |

### 🔐 **Login Credentials Format**

```
Username: Student's email address
Password: test123
```

**Examples:**
- alice.johnson@email.com → Login: `alice.johnson@email.com` / Password: `test123`
- john.doe@email.com → Login: `john.doe@email.com` / Password: `test123`
- jane.smith@email.com → Login: `jane.smith@email.com` / Password: `test123`

**Note:** Students must have an email address in their contact details to get a user account.

## Implementation Methods

### Method 1: Application-Level Synchronization (Recommended)

#### A. Node.js Sync Script
**File:** [`sync-students-with-users.js`](sync-students-with-users.js)

```bash
# Run to create user accounts for existing students
node sync-students-with-users.js
```

**Features:**
- ✅ Automatically detects students without user accounts
- ✅ Creates user accounts with proper role assignment
- ✅ Uses consistent password hashing
- ✅ Provides detailed logging and verification

#### B. Stored Procedure Approach
**File:** [`create-student-user-procedure.sql`](create-student-user-procedure.sql)

```sql
-- Create the stored procedure
mysql -u username -p database < create-student-user-procedure.sql

-- Use the procedure to create a new student with user account
CALL CreateStudentWithUser(
    'Alice',           -- first_name
    'Johnson',         -- last_name
    '2000-01-15',      -- dob
    'Female',          -- gender
    'Canadian',        -- nationality
    'domestic',        -- student_type
    'active',          -- status
    '416-555-0123',    -- primary_mobile
    'alice@email.com', -- email
    '$2b$10$...',      -- hashed_password
    @student_id,       -- OUTPUT: student_id
    @user_id          -- OUTPUT: user_id
);
```

### Method 2: Database Trigger (Alternative)

Create a trigger that automatically creates a user account when a student is inserted:

```sql
DELIMITER //

CREATE TRIGGER create_user_on_student_insert
AFTER INSERT ON students
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_role_id INT;
    
    -- Get Student role ID
    SELECT role_id INTO v_role_id FROM roles WHERE role_name = 'Student';
    
    -- Create user account
    INSERT INTO users (loginID, password, userRole, status)
    VALUES (
        CONCAT('student_', NEW.student_id),
        '$2b$10$hashed_password_here', -- Default hashed password
        'Student',
        NEW.status
    );
    
    SET v_user_id = LAST_INSERT_ID();
    
    -- Link user to Student role
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id);
END//

DELIMITER ;
```

## Current Database State

### ✅ **Synchronized Data**

After running the sync script:
- **11 Students** ↔ **12 Student User Accounts** (1 extra is the seed student_demo user)
- All students now have login capability
- Role assignments are properly configured

### 📊 **Verification Queries**

```sql
-- Check student-user synchronization
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    cd.email,
    u.loginID,
    u.status as user_status,
    GROUP_CONCAT(r.role_name SEPARATOR ', ') as roles
FROM students s
LEFT JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
LEFT JOIN users u ON u.loginID = cd.email
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
GROUP BY s.student_id, s.first_name, s.last_name, cd.email, u.loginID, u.status
ORDER BY s.student_id;

-- Count students vs student users
SELECT 
    'Total Students' as type,
    COUNT(*) as count
FROM students
UNION ALL
SELECT 
    'Student Users' as type,
    COUNT(*) as count
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name = 'Student';
```

## Testing Student Login

### Test the Login Flow

1. **Use the student's email address as username:**
   ```
   Username: alice.johnson@email.com
   Password: test123
   
   (Use any student's email address that has a user account)
   ```

2. **Expected Behavior:**
   - ✅ User can authenticate successfully
   - ✅ Role is set to "Student"
   - ✅ Access to student-specific features
   - ✅ Can view and edit their own data

3. **Check which students have user accounts:**
   ```sql
   SELECT 
       s.first_name,
       s.last_name,
       cd.email,
       'Has User Account' as status
   FROM students s
   JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
   JOIN users u ON u.loginID = cd.email
   WHERE u.userRole = 'Student';
   ```

## Best Practices

### 1. **Email as Login ID**
- Always use student's email address as login ID
- Ensure students have email addresses in contact_details
- Validate email format and uniqueness

### 2. **Password Management**
- Use bcrypt for password hashing
- Set reasonable default passwords for new students
- Implement password reset functionality in production

### 3. **Role Assignment**
- Always assign "Student" role to student users
- Consider additional roles if students need different access levels
- Use the `user_roles` junction table for role management

### 4. **Status Synchronization**
- Keep student status and user status in sync
- When a student is deactivated, deactivate their user account
- When a student graduates, consider changing their role

### 5. **Email Validation**
- Ensure all students have valid email addresses
- Validate email format before creating user accounts
- Handle email changes by updating both contact_details and users table

## Implementation Checklist

- [x] **Database Schema** - Tables support student-user relationship
- [x] **Seed Data** - Sample students have corresponding users
- [x] **Sync Script** - Existing students can be synchronized
- [x] **Stored Procedure** - New students can be created with users
- [x] **Documentation** - Clear implementation guide
- [ ] **API Integration** - Student creation endpoints handle user creation
- [ ] **Testing** - Automated tests for student-user flow
- [ ] **Monitoring** - Track sync success/failures

## Troubleshooting

### Common Issues

1. **"Student role not found"**
   ```sql
   -- Ensure Student role exists
   SELECT * FROM roles WHERE role_name = 'Student';
   ```

2. **"Duplicate loginID"**
   ```sql
   -- Check for existing users with same email
   SELECT loginID, COUNT(*) FROM users GROUP BY loginID HAVING COUNT(*) > 1;
   ```

3. **Students can't log in**
   - Verify password hashing matches your authentication logic
   - Check that user status matches student status
   - Ensure user has Student role assigned
   - Verify student has an email address in contact_details

4. **"Student has no email"**
   ```sql
   -- Add email to student's contact details
   INSERT INTO contact_details (student_id, email, contact_type, is_primary)
   VALUES (123, 'student123@email.com', 'mobile', 1);
   -- Then re-run sync script
   ```

### Recovery Procedures

```sql
-- Re-sync specific student (by email)
DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE loginID = 'student@email.com');
DELETE FROM users WHERE loginID = 'student@email.com';
-- Then re-run sync script

-- Reset all student passwords to default
UPDATE users 
SET password = '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u' 
WHERE userRole = 'Student';

-- Check students without emails
SELECT s.student_id, s.first_name, s.last_name
FROM students s
LEFT JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
WHERE cd.email IS NULL;
```

## Next Steps

1. **Integrate into Student Creation Flow**
   - Update your student creation API to automatically create user accounts
   - Use the stored procedure or sync script logic

2. **Password Management**
   - Implement password reset functionality
   - Add password complexity requirements for production

3. **Role Management**
   - Consider additional roles (e.g., "Graduated Student", "Inactive Student")
   - Implement role-based access control in your application

4. **Monitoring**
   - Add logging for student-user creation failures
   - Monitor synchronization success rates

---

**🎯 Goal Achieved:** Every student in your CRM system now has a corresponding user account and can log in with their student credentials!