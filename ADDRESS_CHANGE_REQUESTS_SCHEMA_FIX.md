# Address Change Requests Schema Fix

## Issue Description

The application was throwing the error:
```
"Unknown column 'reviewed_at' in 'field list'"
```

When trying to insert into the `address_change_requests` table, even though the TypeORM entity (`AddressChangeRequest`) clearly defined this column.

## Root Cause Analysis

1. **Entity Definition**: The `AddressChangeRequest` entity correctly defines the `reviewed_at`, `reviewed_by`, and `review_comments` columns (lines 79-102 in `src/entities/student/address-change-request.entity.ts`)

2. **Complete Schema File**: The `complete-database-schema.sql` file correctly includes these columns in the table definition (lines 214-229)

3. **Migration File**: However, the TypeScript migration file (`src/migrations/1704205700000-MasterCreateCompleteDatabaseSchema.ts`) was missing these columns in the table creation statement (lines 262-277)

4. **Database Reality**: When the migration was run, it created the table without the missing columns, causing the schema mismatch

## Solution Implemented

### 1. Schema Fix SQL (`fix-address-change-requests-schema.sql`)
- Adds the missing columns to the existing table:
  - `reviewed_at` TIMESTAMP NULL
  - `reviewed_by` VARCHAR(100) NULL  
  - `review_comments` TEXT NULL
- Also fixes the `status` column to use the proper ENUM type instead of VARCHAR
- Includes safeguards to only add columns if they don't already exist

### 2. Database Fix Script (`fix-database-schema.js`)
- Connects to the database using environment variables
- Executes the schema fix SQL
- Verifies the table structure after the fix
- Tests the original failing query to confirm it works
- Cleans up test data

### 3. Migration File Update
- Updated `src/migrations/1704205700000-MasterCreateCompleteDatabaseSchema.ts` to include all required columns
- Ensures future database setups will have the correct schema from the start

## How to Run the Fix

### Option 1: Using the Node.js Script
```bash
node fix-database-schema.js
```

### Option 2: Manual SQL Execution
```bash
mysql -u your_username -p your_database_name < fix-address-change-requests-schema.sql
```

## Verification

After running the fix, you can verify the table structure with:

```sql
DESCRIBE address_change_requests;
```

Expected columns:
- `acr_id` (int, AUTO_INCREMENT, PRIMARY KEY)
- `student_id` (int, NOT NULL)
- `current_address` (varchar(255))
- `new_address` (varchar(255))
- `effective_date` (date)
- `change_reason` (varchar(255))
- `impact_acknowledged` (tinyint)
- `status` (enum: 'pending','approved','rejected','implemented')
- `reviewed_at` (timestamp) ✅ **Fixed**
- `reviewed_by` (varchar(100)) ✅ **Fixed**
- `review_comments` (text) ✅ **Fixed**

## Prevention Measures

1. **Schema Synchronization**: Always ensure that:
   - Entity definitions
   - Complete schema SQL files
   - Migration files
   
   All contain the same column definitions.

2. **Testing**: Test migrations on a development database before deploying to production.

3. **Version Control**: Keep migration files in sync with entity changes.

## Files Modified

1. `fix-address-change-requests-schema.sql` - Created
2. `fix-database-schema.js` - Created  
3. `src/migrations/1704205700000-MasterCreateCompleteDatabaseSchema.ts` - Updated

## Test the Fix

### ✅ VERIFIED: Fix Applied Successfully

The schema fix has been applied and tested successfully. Results:

```
🧪 Testing the schema fix...
✅ Database connection established
📊 Required columns found:
  ✅ review_comments
  ✅ reviewed_at
  ✅ reviewed_by
✅ All required columns exist!

🧪 Testing INSERT with all columns...
✅ INSERT successful! Row ID: 2
✅ Record retrieved successfully:
  - Current Address: 123 Old St
  - New Address: 456 New Ave
  - Reviewed At: 2026-01-05T04:59:39.000Z
  - Reviewed By: Test Reviewer
  - Review Comments: Test comment
🧹 Test data cleaned up

🎉 All tests passed! The schema fix is working correctly.
✅ The "Unknown column 'reviewed_at'" error should now be resolved.
```

### Quick Test Script

You can verify the fix works by running:
```bash
node test-schema-fix.js
```

### Manual Verification

To manually test that the original error is resolved:

```sql
-- First ensure you have a valid student_id
SELECT student_id FROM students LIMIT 1;

-- Then test the insert (replace X with actual student_id)
INSERT INTO `address_change_requests`(
  `acr_id`, `student_id`, `current_address`, `new_address`, 
  `effective_date`, `change_reason`, `impact_acknowledged`, 
  `status`, `reviewed_at`, `reviewed_by`, `review_comments`
) VALUES (
  DEFAULT, X, '789 University Avenue, Toronto, ON', 
  '101 Campus Lane, Toronto, ON', '2024-05-01', 
  'Closer to training facility and university', 
  true, 'pending', NOW(), 'Test Reviewer', 'Test comment'
);
```

This should now execute without the "Unknown column 'reviewed_at'" error.