# Comprehensive Migration Guide

## Problem Solved ✅

**Current Status**: The immediate "Unknown column 'reviewed_at'" error has been resolved using the schema fix. However, for long-term maintainability, this guide provides a **single, comprehensive migration** that creates the complete database schema matching all TypeORM entities exactly.

### Immediate Fix Applied ✅
- Missing columns have been added to `address_change_requests` table
- All INSERT operations now work correctly
- Original error is resolved

### Why Use the Comprehensive Migration?
This approach ensures:

1. **No schema mismatches** - Database matches entities perfectly
2. **Fresh start capability** - Can drop and recreate database cleanly  
3. **Future-proof** - Single source of truth for the complete schema
4. **Easy troubleshooting** - No hidden dependencies or cumulative fixes

## New Migration Files

### 1. TypeScript Migration (For TypeORM)
**File:** [`src/migrations/1704205800000-CompleteEntityMatchingSchema.ts`](src/migrations/1704205800000-CompleteEntityMatchingSchema.ts)

This is the **recommended migration file** for TypeORM projects. It:
- Creates all tables matching entities exactly
- Includes proper foreign key constraints
- Sets up all indexes
- Seeds default roles
- Provides proper up/down migration methods

### 2. SQL Migration (For Direct Database Setup)
**File:** [`complete-entity-matching-schema.sql`](complete-entity-matching-schema.sql)

This is a **pure SQL version** that can be run directly against any MySQL database. It's useful for:
- Manual database setup
- Database administration tools
- Continuous integration pipelines
- Backup/restore scenarios

## How to Use

### Option 1: Fresh Database Setup (Recommended)

1. **Drop existing database** (if applicable):
   ```bash
   mysql -u username -p -e "DROP DATABASE IF EXISTS your_database_name;"
   mysql -u username -p -e "CREATE DATABASE your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **Apply the complete schema**:
   
   **For TypeORM projects:**
   ```bash
   npm run migration:run
   # or
   yarn migration:run
   ```
   
   **For direct SQL:**
   ```bash
   mysql -u username -p your_database_name < complete-entity-matching-schema.sql
   ```

### Option 2: Using TypeORM CLI

1. **Update your `ormconfig.js`** to include the new migration:
   ```javascript
   module.exports = {
     type: 'mysql',
     host: process.env.DB_HOST || 'localhost',
     port: process.env.DB_PORT || 3306,
     username: process.env.DB_USER || 'root',
     password: process.env.DB_PASSWORD || '',
     database: process.env.DB_NAME || 'crm',
     entities: ['src/entities/*.entity{.ts,.js}'],
     migrations: ['src/migrations/*{.ts,.js}'],
     cli: {
       migrationsDir: 'src/migrations',
     },
   };
   ```

2. **Run the migration**:
   ```bash
   npm run typeorm migration:run
   ```

### Option 3: Development with Existing Data

If you have existing data you want to preserve:

1. **Backup your current database**:
   ```bash
   mysqldump -u username -p your_database_name > backup.sql
   ```

2. **Compare schemas** to see what needs to be added:
   ```sql
   -- Check current address_change_requests table structure
   DESCRIBE address_change_requests;
   
   -- Compare with expected structure from the entity
   -- The new migration includes ALL columns from all entities
   ```

3. **Apply only the missing parts** (if needed):
   ```sql
   -- This would be specific to your current schema
   -- The fix-address-change-requests-schema.sql can help identify differences
   ```

## Schema Verification

### Check All Tables Match Entities

Run this query to verify your schema matches the entities:

```sql
-- Check address_change_requests table (the problematic one)
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'address_change_requests'
ORDER BY ORDINAL_POSITION;

-- Expected columns:
-- acr_id, student_id, current_address, new_address, effective_date, 
-- change_reason, impact_acknowledged, status, reviewed_at, reviewed_by, review_comments
```

### Entity-Table Mapping

All entities are mapped to tables exactly:

| Entity | Table | Key Fields |
|--------|-------|------------|
| `User` | `users` | `id`, `loginID`, `password`, `userRole`, `status`, `isDeleted`, `createdAt`, `updatedAt` |
| `Student` | `students` | `student_id`, `first_name`, `last_name`, `dob`, `status`, `isDeleted`, `createdAt`, `updatedAt` |
| `ContactDetails` | `contact_details` | `contact_id`, `student_id`, `email`, `primary_mobile`, `contact_type` |
| `VisaDetails` | `visa_details` | `visa_id`, `student_id`, `visa_number`, `status`, `expiry_date` |
| `Address` | `addresses` | `address_id`, `student_id`, `line1`, `city`, `address_type` |
| `EligibilityStatus` | `eligibility_status` | `status_id`, `student_id`, `overall_status`, `classes_completed` |
| `StudentLifestyle` | `student_lifestyle` | `lifestyle_id`, `student_id`, `currently_working`, `married` |
| `PlacementPreferences` | `placement_preferences` | `preference_id`, `student_id`, `urgency_level` |
| `FacilityRecords` | `facility_records` | `facility_id`, `student_id`, `facility_name`, `application_status` |
| `AddressChangeRequest` | `address_change_requests` | `acr_id`, `student_id`, `status`, `reviewed_at`, `reviewed_by` |
| `JobStatusUpdate` | `job_status_updates` | `jsu_id`, `student_id`, `status`, `last_updated_on` |

## Testing the Migration

### Test Results ✅

**Current Database Status** (verified with `test-complete-migration.js`):
```
✅ All 13 expected tables exist
✅ address_change_requests has all 11 required columns
✅ INSERT with all columns works successfully
✅ Data retrieval with all columns works
✅ Foreign key relationships are intact
✅ No "Unknown column" errors
```

**The immediate issue is resolved**, but the comprehensive migration provides better long-term maintainability.

### Test Scripts

**Current State Test:**
```bash
node test-complete-migration.js  # Tests current database state
```

**Schema Fix Test:**
```bash
node test-schema-fix.js  # Tests the applied fix
```

### Manual Testing

1. **Test the original failing query**:
   ```sql
   INSERT INTO address_change_requests (
     acr_id, student_id, current_address, new_address, 
     effective_date, change_reason, impact_acknowledged, 
     status, reviewed_at, reviewed_by, review_comments
   ) VALUES (
     DEFAULT, 1, '123 Old St', '456 New Ave', '2024-05-01', 
     'Test reason', true, 'pending', NOW(), 'Test Reviewer', 'Test comment'
   );
   ```

2. **Verify data retrieval**:
   ```sql
   SELECT * FROM address_change_requests WHERE reviewed_at IS NOT NULL;
   ```

## Benefits of This Approach

### 1. **Complete Schema Consistency**
- Every entity field has a corresponding database column
- No missing columns or data type mismatches
- Proper foreign key relationships

### 2. **Maintainability**
- Single migration file for the complete schema
- Easy to understand and modify
- No cumulative fixes or patches

### 3. **Deployment Safety**
- Fresh database setup guarantees consistency
- No dependency on existing schema state
- Reproducible across environments

### 4. **Development Experience**
- TypeORM entities work without additional configuration
- No runtime schema errors
- Full IDE autocomplete and type safety

## Migration History

| Migration | Purpose | Status |
|-----------|---------|--------|
| `1704205400000` | Users and Roles Tables | Legacy |
| `1704205700000` | Master Complete Database Schema | **Incomplete** (missing columns) |
| `1704205800000` | **Complete Entity Matching Schema** | **✅ Complete & Recommended** |

## Rollback Plan

If you need to rollback:

```sql
-- Drop all tables (reverse order due to foreign keys)
DROP TABLE IF EXISTS job_status_updates;
DROP TABLE IF EXISTS address_change_requests;
DROP TABLE IF EXISTS facility_records;
DROP TABLE IF EXISTS placement_preferences;
DROP TABLE IF EXISTS student_lifestyle;
DROP TABLE IF EXISTS eligibility_status;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS visa_details;
DROP TABLE IF EXISTS contact_details;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
```

Then re-run the complete migration.

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**
   - Ensure tables are created in the correct order
   - Check that referenced tables exist before creating dependent tables

2. **Character Set Issues**
   - Use UTF8MB4 character set for proper emoji support
   - Set proper collation: `utf8mb4_unicode_ci`

3. **Permission Errors**
   - Ensure database user has CREATE, ALTER, INSERT privileges
   - Check MySQL version compatibility (5.7+ recommended)

### Verification Queries

```sql
-- Check all tables exist
SHOW TABLES;

-- Check foreign key constraints
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = DATABASE();

-- Check indexes
SHOW INDEX FROM address_change_requests;
```

This comprehensive migration ensures your database schema perfectly matches your TypeORM entities, eliminating the "Unknown column" errors and providing a solid foundation for your CRM application.