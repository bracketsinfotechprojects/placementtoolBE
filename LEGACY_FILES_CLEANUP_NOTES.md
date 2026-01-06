# Legacy Files Cleanup - user_roles Table References

## Files That Still Reference user_roles Table

The following files contain references to the old `user_roles` junction table design and should be updated or removed:

### 1. **SQL Schema Files (Legacy)**
- `src/database/users-roles-tables.sql`
- `src/database/user-roles-schema.sql` 
- `src/database/complete-database-schema.sql`

**Action**: These are legacy SQL files. The migration system now handles schema creation, so these can be:
- **Deleted** (recommended), OR
- **Updated** to reflect the new roleID design

### 2. **Documentation Files**
- `src/database/user-roles-documentation.md`

**Action**: Update documentation to reflect the new direct foreign key design.

## Current Working Design

### ✅ **Active Migration**: `src/migrations/1704205800000-CompleteEntityMatchingSchema.ts`
- Creates **12 tables total** (no user_roles table)
- Uses direct foreign key: `users.roleID → roles.role_id`
- Proper constraints and indexes

### ✅ **Active Entity**: `src/entities/user/user.entity.ts`
- Has `roleID` int column (not `userRole` varchar)
- Direct relationship to roles table

### ✅ **Active Services**: 
- `src/services/user/user.service.ts` - Uses roleID lookup
- `src/services/student/student.service.ts` - Direct role assignment

## Migration Path for Existing Systems

If you have an existing database with the old design:

```sql
-- Drop old junction table (if exists)
DROP TABLE IF EXISTS user_roles;

-- Alter users table to add roleID column
ALTER TABLE users ADD COLUMN roleID int NOT NULL DEFAULT 1;

-- Update existing users with roleIDs based on userRole
UPDATE users SET roleID = 
  CASE userRole
    WHEN 'admin' THEN 1
    WHEN 'facility' THEN 2  
    WHEN 'supervisor' THEN 3
    WHEN 'placement_executive' THEN 4
    WHEN 'trainer' THEN 5
    WHEN 'student' THEN 6
    ELSE 1
  END;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT FK_users_role 
  FOREIGN KEY (roleID) REFERENCES roles(role_id) ON DELETE RESTRICT;

-- Drop old userRole column
ALTER TABLE users DROP COLUMN userRole;
```

## Summary

✅ **Migration system uses correct design (12 tables)**  
✅ **Active codebase uses roleID foreign key**  
⚠️ **Legacy SQL files still reference old design**  
⚠️ **Documentation needs updating**

The core application is correctly implemented with the direct foreign key design. Only legacy reference files need cleanup.