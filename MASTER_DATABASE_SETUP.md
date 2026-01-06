# Master Database Setup Guide

## Overview

This guide provides a **single migration solution** that creates the complete database schema with all required fields, eliminating missing column issues.

## Single Migration Approach

### Benefits
✅ **Complete Schema**: All tables with all fields in one migration  
✅ **No Missing Fields**: Matches entity definitions exactly  
✅ **Future-Proof**: Prevents field-related errors  
✅ **Simple Setup**: One command creates everything  
✅ **Consistent**: All tables follow the same pattern  

## Quick Start

### Option 1: Run Master Migration (Recommended)
```bash
npm run migration:run
```

This executes the single migration: `1704205700000-CreateCompleteDatabaseSchema.ts`

### Option 2: Manual SQL Setup
```sql
SOURCE src/database/complete-database-schema.sql;
```

## Complete Database Schema

### User Management System
- **roles**: User role definitions (Admin, Facility, Supervisor, etc.)
- **users**: Application users with authentication
- **user_roles**: User-role assignments (many-to-many)

### Student Management System
- **students**: Core student information
- **contact_details**: Student contact information
- **visa_details**: Visa status and details
- **addresses**: Student address information

### Student Status & Lifestyle
- **eligibility_status**: Academic eligibility tracking
- **student_lifestyle**: Lifestyle and preferences
- **placement_preferences**: Job placement preferences

### Facility & Job Tracking
- **facility_records**: Training facility records
- **address_change_requests**: Address change tracking
- **job_status_updates**: Employment status updates

## Field Coverage

### All Tables Include
- **Primary Keys**: Auto-incrementing IDs
- **Foreign Keys**: Proper relationships with CASCADE delete
- **Indexes**: Performance optimization
- **Soft Delete**: `isDeleted` columns for data recovery
- **Timestamps**: `created_at` and `updatedAt` columns
- **Constraints**: ENUM values and data validation

### Entity Matching
The migration exactly matches all TypeORM entities:
- ✅ User entity fields
- ✅ Student entity fields  
- ✅ All relationship entities
- ✅ All enum constraints
- ✅ All index requirements

## Migration Details

### File: `src/migrations/1704205700000-MasterCreateCompleteDatabaseSchema.ts`

**⭐ THIS IS THE ONLY MIGRATION FILE ⭐**

Replaces all previous migration files with a single comprehensive solution.

**Creates 13 tables:**
1. roles
2. users
3. user_roles
4. students
5. contact_details
6. visa_details
7. addresses
8. eligibility_status
9. student_lifestyle
10. placement_preferences
11. facility_records
12. address_change_requests
13. job_status_updates

**Includes:**
- All column definitions from entities
- Proper foreign key constraints
- Performance indexes
- Default role seeding
- MySQL compatibility
- Error handling

## Error Prevention

### Before (Multiple Migrations Issues)
- ❌ Missing `isDeleted` columns
- ❌ Missing `overall_status` column
- ❌ Inconsistent table definitions
- ❌ Migration order dependencies

### After (Single Migration Solution)
- ✅ All fields present from start
- ✅ Complete entity matching
- ✅ No field-related errors
- ✅ Consistent schema

## Verification

After running the migration, verify with:

```bash
# Check tables created
mysql -u user -p -e "SHOW TABLES LIKE '%';"

# Check specific tables
mysql -u user -p -e "DESCRIBE students;"
mysql -u user -p -e "DESCRIBE eligibility_status;"
mysql -u user -p -e "DESCRIBE users;"

# Check default roles
mysql -u user -p -e "SELECT * FROM roles;"
```

## Troubleshooting

### Migration Fails
```bash
# Check database connection
node test-connection.js

# Verify permissions
# Need: CREATE, ALTER, INSERT, INDEX privileges

# Check for existing tables
mysql -u user -p -e "DROP DATABASE IF EXISTS crm_db; CREATE DATABASE crm_db;"
npm run migration:run
```

### Field Mismatches
This should not happen with the master migration, but if it does:

```bash
# Compare entity vs database
node -e "
const entities = require('./src/entities');
console.log('Entities loaded:', Object.keys(entities));
"
```

## Database Schema Summary

```sql
-- Users & Roles
roles { role_id, role_name, isDeleted, timestamps }
users { id, loginID, password, userRole, status, isDeleted, timestamps }
user_roles { user_id, role_id, timestamps }

-- Students & Contacts  
students { student_id, personal_info, status, isDeleted, timestamps }
contact_details { contact_id, student_id, contact_info, verified_at }
visa_details { visa_id, student_id, visa_info, status }
addresses { address_id, student_id, address_info, type, is_primary }

-- Status & Preferences
eligibility_status { status_id, student_id, completion_flags, overall_status, isDeleted, timestamps }
student_lifestyle { lifestyle_id, student_id, lifestyle_info }
placement_preferences { preference_id, student_id, placement_info }

-- Tracking
facility_records { facility_id, student_id, facility_info, application_status }
address_change_requests { acr_id, student_id, change_info }
job_status_updates { jsu_id, student_id, job_info, timestamps }
```

## Development Workflow

### Fresh Setup
```bash
1. npm run migration:run
2. node verify-roles.js
3. npm run dev  # Start development server
```

### Production Deployment
```bash
1. Backup existing database
2. npm run migration:run
3. Verify schema
4. Restart application
5. Test functionality
```

## Maintenance

### Regular Checks
```bash
# Weekly schema verification
mysql -u user -p -e "
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'crm_db' 
ORDER BY table_name, ordinal_position;
"

# Index performance
mysql -u user -p -e "
SHOW INDEX FROM students;
SHOW INDEX FROM eligibility_status;
"
```

### Updates
When adding new fields:
1. Update the corresponding entity
2. Update the master migration (or create new migration)
3. Test in development
4. Deploy to production

## Benefits Summary

🎯 **Single Source of Truth**: One migration defines everything  
🛡️ **Error Prevention**: All fields present from start  
⚡ **Performance**: Optimized indexes included  
🔄 **Consistency**: All tables follow same patterns  
🧪 **Testing**: Easy to verify and debug  
🚀 **Deployment**: Simple production setup  

---

**Result**: Complete, production-ready database schema with zero missing fields!