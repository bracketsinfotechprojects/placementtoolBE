# Data Clear Guide

This guide explains how to clear all data from the database while preserving table structures.

## Why Clear Data?

- **Testing**: Reset database for fresh tests
- **Development**: Start with clean slate
- **Demo**: Prepare database for demonstrations
- **Troubleshooting**: Clear corrupted or test data

## Methods to Clear Data

### Method 1: Node.js Script (Recommended)

```bash
node clear-all-data.js
```

**Features:**
- ✅ Safe foreign key handling
- ✅ Progress reporting
- ✅ Row count verification
- ✅ Error handling
- ✅ Preserves table structures

### Method 2: SQL Script

```sql
-- Execute the SQL file
SOURCE clear-all-data.sql;

-- Or run individual commands
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM job_status_updates;
DELETE FROM address_change_requests;
-- ... (all tables)
SET FOREIGN_KEY_CHECKS = 1;
```

**Features:**
- ✅ Direct SQL execution
- ✅ Foreign key checks management
- ✅ Verification queries included

## Tables Cleared (in order)

1. **Student-dependent tables first:**
   - `job_status_updates`
   - `address_change_requests`
   - `facility_records`
   - `placement_preferences`
   - `student_lifestyle`
   - `eligibility_status`
   - `addresses`
   - `visa_details`
   - `contact_details`
   - `students`

2. **User system tables:**
   - `user_roles`
   - `users`
   - `roles`

## What is Preserved

✅ **Table Structures**: All columns, indexes, constraints remain intact  
✅ **Database Schema**: Complete schema unchanged  
✅ **Default Data**: Roles and other seeded data removed  
✅ **Relationships**: Foreign key relationships maintained  

## What is Deleted

❌ **All Row Data**: Every record in every table  
❌ **User Accounts**: All user records  
❌ **Student Records**: All student information  
❌ **System Data**: All configuration and status data  

## Safety Features

### Foreign Key Handling
```javascript
// Automatically handled in the script
SET FOREIGN_KEY_CHECKS = 0;  // Disable during deletion
// ... clear tables ...
SET FOREIGN_KEY_CHECKS = 1;  // Re-enable after deletion
```

### Error Handling
- Continues even if individual table clearing fails
- Reports success/failure for each table
- Always attempts to re-enable foreign key checks

### Verification
```bash
# After clearing, verify with:
node clear-all-data.js

# Output shows:
# ✅ Cleared students: 0 rows deleted
# ✅ Cleared users: 0 rows deleted
# ✅ Cleared roles: 0 rows deleted
```

## Usage Examples

### Before Testing
```bash
# Clear all data
node clear-all-data.js

# Run migration (if needed)
npm run migration:run

# Start fresh testing
npm test
```

### Development Reset
```bash
# Clear all data
node clear-all-data.js

# Insert fresh test data
node seed-test-data.js

# Start development server
npm run dev
```

### Production Caution

⚠️ **Never run this in production** unless you:
1. Have a recent database backup
2. Are certain you want to delete all data
3. Have tested the process in development/staging first

## Alternative: Selective Clearing

If you don't want to clear everything:

```sql
-- Clear only specific tables
DELETE FROM students;
DELETE FROM users;

-- Or use the script and comment out lines
```

## Troubleshooting

### Foreign Key Errors
```bash
# Ensure the script runs without interruption
# Foreign key checks should be automatically managed
```

### Permission Errors
```sql
-- Ensure your database user has DELETE privileges
GRANT DELETE ON crm_db.* TO 'your_user'@'localhost';
```

### Connection Errors
```bash
# Check environment variables
echo $DB_HOST $DB_USER $DB_NAME

# Test connection
node test-connection.js
```

---

**Remember**: This clears ALL data but preserves your database structure. Use with caution!