# isDeleted Column Fix - Soft Delete Implementation

## Problem Description

The application was throwing the error: **"Unknown column 'isDeleted' in 'field list'"** when trying to add new students.

## Root Cause

The application code expects an `isDeleted` column in database tables for soft delete functionality, but this column was missing from the actual database schema.

### Where isDeleted is Used

The `isDeleted` field is used throughout the application for:
- **Soft deletes**: Instead of physically deleting records, they are marked as deleted
- **Query filtering**: Most queries filter out deleted records with `WHERE isDeleted = false`
- **Data integrity**: Ensures deleted data can be recovered if needed

### Files That Reference isDeleted

- `src/entities/base/base.entity.ts` - Defines the isDeleted column
- `src/services/student/student.service.ts` - Uses isDeleted in queries and updates
- `src/utilities/api.utility.ts` - Removes isDeleted from API responses

## Solution

### Option 1: Run Migration (Recommended)

```bash
npm run migration:run
```

This will execute the migration `1704205500000-AddIsDeletedColumn.ts` which adds the `isDeleted` column to all required tables.

### Option 2: Run SQL Script Manually

```sql
-- Execute the contents of src/database/add-isdeleted-columns.sql
SOURCE src/database/add-isdeleted-columns.sql;
```

### Option 3: Individual Table Updates

If you prefer to run the SQL directly:

```sql
-- Add isDeleted column to students table
ALTER TABLE `students` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add isDeleted column to users table  
ALTER TABLE `users` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add isDeleted column to roles table
ALTER TABLE `roles` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add performance indexes
CREATE INDEX idx_students_isdeleted ON students(isDeleted);
CREATE INDEX idx_users_isdeleted ON users(isDeleted);
CREATE INDEX idx_roles_isdeleted ON roles(isDeleted);
```

## Verification

After applying the fix, verify it worked by running:

```bash
node check-isdeleted-column.js
```

This script will:
- Check if the `isDeleted` column exists in all required tables
- Test a sample query to ensure no "Unknown column" errors occur
- Provide clear status messages

## Expected Output After Fix

```
✅ Connected to database

🔍 Checking for isDeleted columns:
==================================================
✅ Table 'students': isDeleted column exists
✅ Table 'users': isDeleted column exists  
✅ Table 'roles': isDeleted column exists

🧪 Testing student query...
✅ Student query successful - isDeleted column is accessible

🔌 Database connection closed
```

## How Soft Delete Works

With the `isDeleted` column in place:

1. **Creating Records**: New records are created with `isDeleted = 0` (false)
2. **Querying Records**: Application filters with `WHERE isDeleted = false`
3. **Deleting Records**: Instead of DELETE, the system updates `isDeleted = true`
4. **Recovery**: Deleted records can be recovered by setting `isDeleted = false`

## Column Specification

- **Type**: `tinyint` (boolean)
- **Default**: `0` (false)
- **Null**: Not allowed
- **Purpose**: Soft delete flag

## Troubleshooting

### Migration Fails
- Ensure database connection is active
- Check database user permissions (needs ALTER privileges)
- Verify tables exist before adding columns

### Still Getting Errors
- Run the verification script: `node check-isdeleted-column.js`
- Check that all tables (students, users, roles) have the column
- Restart the application after applying the fix

### Column Already Exists
If you get "Duplicate column name" errors, the column may already exist. This is safe to ignore, or you can drop and recreate the column if needed.