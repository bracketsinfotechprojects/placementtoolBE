# Overall Status Column Fix - Eligibility Status Enhancement

## Problem Description

The application was throwing the error: **"Unknown column 'overall_status' in 'field list'"** when trying to access eligibility status information.

## Root Cause

The `EligibilityStatus` entity expects an `overall_status` column in the `eligibility_status` table, but the existing migration created the table without this column.

### Entity vs Database Mismatch

**Entity Definition** (`src/entities/student/eligibility-status.entity.ts`):
```typescript
@Column({
  type: 'enum',
  enum: ['eligible', 'not_eligible', 'pending', 'override'],
  default: 'not_eligible',
  name: 'overall_status',
  comment: 'Overall eligibility status'
})
overall_status: 'eligible' | 'not_eligible' | 'pending' | 'override';
```

**Existing Database Schema** (`1704205300000-CreateRemainingStudentTables.ts`):
```sql
CREATE TABLE `eligibility_status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `classes_completed` tinyint NULL,
  `fees_paid` tinyint NULL,
  -- ... other columns but missing overall_status
);
```

## Solution

### Option 1: Run Migration (Recommended)

```bash
npm run migration:run
```

This will execute the migration `1704205600000-AddOverallStatusColumn.ts` which adds:
- `overall_status` column (enum: eligible, not_eligible, pending, override)
- `isDeleted` column for soft delete support
- `created_at` and `updatedAt` timestamp columns
- Performance indexes

### Option 2: Manual Fix Script

```bash
node fix-overall-status.js
```

This script:
- Checks if the table and columns exist
- Adds missing columns safely
- Creates performance indexes
- Provides detailed feedback

### Option 3: Manual SQL

```sql
-- Add overall_status column
ALTER TABLE `eligibility_status` 
ADD COLUMN `overall_status` enum('eligible', 'not_eligible', 'pending', 'override') NOT NULL DEFAULT 'not_eligible';

-- Add isDeleted column for consistency
ALTER TABLE `eligibility_status` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add timestamp columns
ALTER TABLE `eligibility_status` 
ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `eligibility_status` 
ADD COLUMN `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add performance indexes
CREATE INDEX `IDX_eligibility_status_overall` ON `eligibility_status` (`overall_status`);
CREATE INDEX `IDX_eligibility_isdeleted` ON `eligibility_status` (`isDeleted`);
```

## Verification

After applying the fix, verify it worked:

```bash
node fix-overall-status.js
```

Expected output:
```
✅ Connected to database
🔍 Checking eligibility_status table structure...
✅ overall_status column already exists
✅ isDeleted column already exists
🔄 Adding performance indexes...
✅ Created index for overall_status
✅ Created index for isDeleted
🧪 Testing eligibility status query...
✅ Eligibility status query successful - overall_status column is accessible
🎉 Fix completed! The eligibility_status table now has all required columns.
```

## Column Specifications

### overall_status Column
- **Type**: `enum('eligible', 'not_eligible', 'pending', 'override')`
- **Default**: `'not_eligible'`
- **Purpose**: Overall eligibility determination
- **Usage**: Used by `isEligible()` helper method

### isDeleted Column  
- **Type**: `tinyint` (boolean)
- **Default**: `0` (false)
- **Purpose**: Soft delete functionality
- **Consistency**: Matches other tables in the system

### Timestamp Columns
- **created_at**: Record creation timestamp
- **updatedAt**: Last update timestamp with auto-update

## Application Impact

With the `overall_status` column in place:

1. **Eligibility Queries**: Application can now properly query overall eligibility status
2. **Helper Methods**: `isEligible()` method works correctly
3. **Status Management**: Proper enum values for eligibility states
4. **Soft Delete**: Consistent behavior with other system tables

## Troubleshooting

### Migration Fails
- Ensure the base migration `1704205300000-CreateRemainingStudentTables.ts` ran successfully
- Check database permissions (needs ALTER privileges)

### Column Already Exists
If you get "Duplicate column name" errors, the column may already exist. This is safe to ignore.

### Table Doesn't Exist
```bash
# Run all migrations first
npm run migration:run

# Then check status
node fix-overall-status.js
```

## Complete Migration Sequence

For a fresh setup, run these commands in order:

1. **Run all migrations**:
   ```bash
   npm run migration:run
   ```

2. **Verify user roles**:
   ```bash
   node verify-roles.js
   ```

3. **Check isDeleted columns**:
   ```bash
   node check-isdeleted-column.js
   ```

4. **Fix overall_status**:
   ```bash
   node fix-overall-status.js
   ```

5. **Test application**:
   Try adding a student via curl - all column errors should be resolved.

## Benefits of This Fix

✅ **Complete Schema**: eligibility_status table now matches entity definition
✅ **Soft Delete Support**: Consistent isDeleted column across all tables  
✅ **Performance**: Added indexes for faster queries
✅ **Timestamp Tracking**: Creation and update timestamps
✅ **Type Safety**: Proper enum constraints for status values
✅ **Backward Compatible**: Existing data is preserved

The eligibility status system is now fully functional with proper database schema support!