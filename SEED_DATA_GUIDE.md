# Seed Data Guide

## Overview

This guide explains how to populate your CRM database with sample data for development and testing purposes.

## Seed Data Files

### 1. SQL File: `seed-data.sql`
**Best for:** Direct SQL execution, database administration tools, CI/CD pipelines

```bash
mysql -u username -p database_name < seed-data.sql
```

### 2. Node.js Script: `seed-database.js`
**Best for:** Development environments, automated seeding with password hashing

```bash
node seed-database.js
```

**Note:** All users will be created with password `test123` (hashed automatically)

## What Gets Seeded

### 👥 Users (8 total)
**ALL USERS USE PASSWORD: `test123`**

| Login ID | Password | Role | Status |
|----------|----------|------|--------|
| admin | test123 | Admin | active |
| facility_manager | test123 | Facility | active |
| supervisor_john | test123 | Supervisor | active |
| placement_executive | test123 | Placement Executive | active |
| trainer_mary | test123 | Trainer | active |
| student_demo | test123 | Student | active |
| test_user | test123 | user | active |
| inactive_user | test123 | user | inactive |

### 🏷️ Roles (6 total)
- Admin
- Facility  
- Supervisor
- Placement Executive
- Trainer
- Student

### 🔗 User-Role Mappings
- Most users get their primary role
- Admin user also gets Trainer role (demonstrates multiple roles)
- User-role relationships stored in junction table

### 🎓 Sample Students (11 total)
**NOTE: All students have corresponding user accounts for login**

- John Doe (Canadian, domestic, active) → Login: `student_2`
- Jane Smith (International, active) → Login: `student_3`
- Mike Johnson (Canadian, domestic, active) → Login: `student_4`
- Sarah Wilson (International, active) → Login: `student_5`
- David Brown (Canadian, domestic, graduated) → Login: `student_6`
- (Plus 6 additional students from previous seeding)

### Student Login Format
```
Username: student_{student_id}
Password: test123
```

## How to Use

### Option 1: SQL File (Recommended for Production)
```bash
# Apply migration first
npm run migration:run

# Then seed data
mysql -u your_username -p your_database_name < seed-data.sql
```

### Option 2: Node.js Script (Recommended for Development)
```bash
# Install bcrypt if not already installed
npm install bcrypt

# Apply migration first
npm run migration:run

# Then seed data with password hashing
node seed-database.js
```

## Security Notes ⚠️

### Password Hashing
- **SQL file**: Uses placeholder hashed passwords (`$2b$10$...`)
- **Node.js script**: Uses `bcrypt` to hash real passwords

### For Production Use
1. Change all default passwords immediately
2. Use strong, unique passwords
3. Implement proper password policies
4. Consider using environment variables for sensitive data
5. Regular password rotation

## Verification

After seeding, verify the data:

```sql
-- Check all tables have data
SELECT 'ROLES' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'USERS' as table_name, COUNT(*) as count FROM users
UNION ALL  
SELECT 'USER_ROLES' as table_name, COUNT(*) as count FROM user_roles
UNION ALL
SELECT 'STUDENTS' as table_name, COUNT(*) as count FROM students;

-- View users with their roles
SELECT 
    u.loginID,
    u.userRole,
    GROUP_CONCAT(r.role_name SEPARATOR ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
GROUP BY u.id, u.loginID, u.userRole;
```

## Test Login Credentials

Use these credentials to test your application:

**ALL USERS USE PASSWORD: `test123`**

### Admin Access
- **URL:** `/login`
- **Username:** `admin`
- **Password:** `test123`
- **Roles:** Admin, Trainer

### Student Access  
- **URL:** `/login`
- **Username:** `student_demo`
- **Password:** `test123`
- **Roles:** Student

### Facility Manager
- **URL:** `/login`
- **Username:** `facility_manager` 
- **Password:** `test123`
- **Roles:** Facility

## Student-User Synchronization

**Important:** Every student in the CRM must have a corresponding user account for login.

### Automatic Sync
After seeding, run the student-user synchronization:

```bash
node sync-students-with-users.js
```

This script:
- ✅ Creates user accounts for all students without them
- ✅ Assigns "Student" role to each student user
- ✅ Uses consistent login format: `student_{student_id}`
- ✅ Sets password to `test123` for all student users

### Manual Student Creation
For new students, use the stored procedure:

```sql
CALL CreateStudentWithUser(
    'Alice', 'Johnson', '2000-01-15', 'Female',
    'Canadian', 'domestic', 'active',
    '416-555-0123', 'alice@email.com',
    '$2b$10$hashed_password', @student_id, @user_id
);
```

## Customization

### Adding More Users
Edit the users array in `seed-database.js`:

```javascript
const users = [
  { loginID: 'new_user', password: 'test123', userRole: 'user', status: 'active' },
  // ... more users
];
```

### Adding More Students
Edit the students array in `seed-database.js`:

```javascript
const students = [
  { first_name: 'Alice', last_name: 'Johnson', dob: '2000-01-01', gender: 'Female', nationality: 'Canadian', student_type: 'domestic', status: 'active' },
  // ... more students
];
```

### Custom Roles
Add to the roles array in `seed-database.js`:

```javascript
const roles = ['Admin', 'Facility', 'Supervisor', 'Placement Executive', 'Trainer', 'Student', 'Custom Role'];
```

## Troubleshooting

### "Table doesn't exist" Error
```bash
# Make sure migration was applied first
npm run migration:run
```

### "Access denied" Error
```sql
-- Check user permissions
SHOW GRANTS FOR 'your_username'@'localhost';
-- Should include INSERT, SELECT privileges
```

### Duplicate Entry Errors
This is normal - the seeding script uses `INSERT IGNORE` to avoid duplicates if run multiple times.

### Password Not Working
- For SQL file: Use the hashed password values
- For Node.js script: Use the plain text passwords (they get hashed automatically)

## Next Steps

After seeding:
1. ✅ Test login functionality
2. ✅ Verify role-based access control
3. ✅ Test CRUD operations for students
4. ✅ Customize data for your specific use case
5. ✅ Remove or modify seed data for production

---

**Happy coding!** 🎉 Your CRM database now has realistic sample data to work with.