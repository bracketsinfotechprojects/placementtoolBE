# User Roles Management System

This document provides information about the user roles management system implementation in the CRM application.

## Overview

The system implements a role-based access control (RBAC) model with the following components:

- **Roles**: Predefined user roles (Admin, Facility, Supervisor, Placement Executive, Trainer, Student)
- **Users**: Application users with authentication credentials
- **User-Role Assignment**: Junction table linking users to their assigned roles

## Database Schema

### Tables Created

1. **roles** - Stores predefined user roles
2. **users** - Stores user account information
3. **user_roles** - Junction table for many-to-many relationship between users and roles

### Table Structures

#### roles table
```sql
role_id INT AUTO_INCREMENT PRIMARY KEY
role_name VARCHAR(50) UNIQUE NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### users table
```sql
user_id INT AUTO_INCREMENT PRIMARY KEY
username VARCHAR(100) UNIQUE NOT NULL
email VARCHAR(150) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
status ENUM('active','inactive','locked') DEFAULT 'active'
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### user_roles table
```sql
user_id INT (FK to users)
role_id INT (FK to roles)
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
PRIMARY KEY (user_id, role_id)
```

## Files Created

### Migration Files

1. **Consolidated TypeScript Migration**: `src/migrations/1704205400000-CreateUserRolesTables.ts`
   - Complete TypeORM migration for fresh installations
   - Creates roles, users, and user_roles tables
   - Adds isDeleted columns for soft delete support
   - Automatically seeds default roles
   - Includes performance indexes

2. **Consolidated SQL Schema File**: `src/database/user-roles-schema.sql`
   - Complete SQL setup for manual database creation
   - Includes all tables with isDeleted columns
   - Can be used by DBAs or for direct SQL execution
   - Includes all necessary indexes and constraints

## Usage Instructions

### Running the Migration

To apply the migration using TypeORM:

```bash
# Run all pending migrations
npm run migration:run

# Or run specific migration
npm run migration:run -- --src/migrations/1704205400000-CreateUserRolesTables.ts

# To rollback migration
npm run migration:revert
```

### Manual SQL Execution

If you prefer to run the SQL directly:

```sql
-- Execute the contents of src/database/user-roles-schema.sql
SOURCE src/database/user-roles-schema.sql;
```

### Default Roles

The system automatically creates these default roles:
- Admin
- Facility  
- Supervisor
- Placement Executive
- Trainer
- Student

## Implementation Notes

### Complete Setup Solution

The migration provides a complete solution for fresh installations:

- **All Tables**: Creates roles, users, and user_roles tables
- **Soft Delete Support**: Includes isDeleted columns for all tables
- **Default Data**: Automatically seeds 6 default roles
- **Performance**: Includes all necessary indexes
- **Idempotent**: Can be run multiple times safely

### Idempotent Design

Both the TypeORM migration and SQL schema file are designed to be idempotent:

- `CREATE TABLE IF NOT EXISTS` prevents table creation errors
- `ADD COLUMN IF NOT EXISTS` prevents column addition errors
- **Smart Role Insertion**: Uses INSERT IGNORE to prevent duplicates
- All indexes are created with `IF NOT EXISTS` for safe re-execution

### Security Considerations

1. **Password Storage**: The system expects pre-hashed passwords in the `password_hash` field
2. **Status Management**: Users can have statuses of 'active', 'inactive', or 'locked'
3. **Foreign Key Constraints**: Cascade delete is implemented for data integrity

### Performance Optimizations

- Unique indexes on username and email for fast lookups
- Composite primary key on user_roles junction table
- Foreign key indexes for efficient joins

### Future Enhancements

Consider implementing:
- Role permissions table for granular access control
- Audit logging for role changes
- Soft delete functionality
- Password reset token storage

## Integration with Application

To use this system in your application:

1. Import the User entity (when created)
2. Implement authentication middleware
3. Create role-based authorization decorators
4. Build user management interfaces

## Troubleshooting

### Handling Existing Tables

If you encounter errors like "Table 'roles' already exists", the migration is designed to handle this gracefully:

- **TypeORM Migration**: Uses `CREATE TABLE IF NOT EXISTS` and smart role insertion with existence checks
- **SQL Schema File**: Uses `CREATE TABLE IF NOT EXISTS` and conditional INSERT statements
- **Multiple Executions**: Both files can be run multiple times without errors
- **Empty Table Handling**: Roles are inserted only when the roles table is empty or missing specific roles

### Common Issues

1. **Migration fails**: Ensure database connection is active and user has sufficient privileges
2. **Table already exists**: This is now handled automatically by the idempotent design
3. **Roles not inserting**: The system now checks if roles exist before inserting, ensuring proper seeding
4. **Foreign key constraints**: Ensure referenced tables exist before creating constraints

### Troubleshooting Scripts

For additional help with role management, use the provided troubleshooting scripts:

1. **verify-roles.js**: Check if roles were inserted properly
2. **insert-default-roles.js**: Manually insert roles if migration failed

See `ROLE_TROUBLESHOOTING.md` for detailed usage instructions.

### Database Permissions Required

The database user executing these scripts needs:
- CREATE TABLE privileges
- INSERT privileges for initial role data
- INDEX creation privileges