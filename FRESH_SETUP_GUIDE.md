# Fresh Setup Guide - Complete User Roles System

## Overview

This guide provides everything needed to set up the user roles management system in a fresh CRM installation.

## What Gets Created

Running the consolidated migration will create:

### Database Tables
- **roles**: Stores user role definitions
- **users**: Application user accounts  
- **user_roles**: Junction table for user-role assignments
- **students**: Enhanced with isDeleted column (soft delete support)

### Default Data
- 6 default roles: Admin, Facility, Supervisor, Placement Executive, Trainer, Student

### Features
- **Soft Delete Support**: All tables include isDeleted columns
- **Performance Indexes**: Optimized for fast queries
- **Foreign Key Constraints**: Data integrity enforcement
- **Idempotent Design**: Safe to run multiple times

## Quick Start for New Installations

### 1. Run the Migration
```bash
npm run migration:run
```

This single command creates everything needed for the user roles system.

### 2. Verify Setup
```bash
node verify-roles.js
```

Should show 6 default roles successfully created.

### 3. Test Application
Try adding a student via curl - the "Unknown column 'isDeleted'" error should be resolved.

## Files Reference

### Primary Migration
- **File**: `src/migrations/1704205400000-CreateUserRolesTables.ts`
- **Purpose**: Complete TypeORM migration for user roles system
- **Includes**: Tables, columns, indexes, default data, soft delete support

### Manual SQL Option  
- **File**: `src/database/user-roles-schema.sql`
- **Purpose**: Raw SQL for manual database setup
- **Usage**: `SOURCE src/database/user-roles-schema.sql`

### Verification Scripts
- **verify-roles.js**: Check if roles were created successfully
- **check-isdeleted-column.js**: Verify isDeleted columns exist

## Database Schema Overview

```sql
-- Roles table
roles {
  role_id (PK, Auto)
  role_name (Unique)
  isDeleted (Boolean, Default: false)
  created_at, updatedAt
}

-- Users table  
users {
  user_id (PK, Auto)
  username (Unique)
  email (Unique)
  password_hash
  status (active/inactive/locked)
  isDeleted (Boolean, Default: false)
  created_at, updatedAt
}

-- User-Role junction
user_roles {
  user_id (FK)
  role_id (FK)
  created_at
  (PK: user_id + role_id)
}

-- Students table enhancement
students {
  -- existing columns --
  isDeleted (Boolean, Default: false)  -- ADDED
}
```

## Troubleshooting Fresh Setup

### Migration Fails
```bash
# Check database connection
node check-db.js

# Verify permissions
# Database user needs: CREATE, ALTER, INSERT privileges
```

### Roles Not Created
```bash
# Manual role insertion
node insert-default-roles.js

# Verify database
node verify-roles.js
```

### isDeleted Column Missing
```bash
# The migration should add this automatically
# If missing, check migration logs
# Or manually verify: node check-isdeleted-column.js
```

## Development Workflow

### For New Developers
1. Clone repository
2. Set up environment variables
3. Run: `npm run migration:run`
4. Verify: `node verify-roles.js`
5. Start development server

### For Production Deployment
1. Deploy application code
2. Run migration during maintenance window
3. Verify database schema
4. Restart application
5. Test functionality

## Benefits of Consolidated Approach

✅ **Single Migration**: Everything created in one go
✅ **Fresh Setup Friendly**: New installations work immediately  
✅ **Backward Compatible**: Existing installations unaffected
✅ **Soft Delete Ready**: No additional setup needed
✅ **Performance Optimized**: All indexes included
✅ **Idempotent**: Safe to run multiple times

## Environment Configuration

Required environment variables:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
```

## Next Steps

After successful setup:
1. Implement user authentication
2. Create role-based authorization
3. Build user management interfaces
4. Set up API endpoints for user operations

---

**Result**: Complete user roles management system ready for production use!