# MySQL Compatibility Guide

## Issue: ALTER TABLE IF NOT EXISTS

MySQL does not support the `ADD COLUMN IF NOT EXISTS` syntax that is available in MariaDB and other databases.

### Error You Might See:
```sql
ALTER TABLE `students` 
ADD COLUMN IF NOT EXISTS `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Error: You have an error in your SQL syntax...
```

## Solutions

### 1. Updated Migration (Recommended)

The migration has been updated to handle this gracefully with try-catch blocks:

```typescript
// In migration: src/migrations/1704205400000-CreateUserRolesTables.ts
try {
  await queryRunner.query(`
    ALTER TABLE \`students\` 
    ADD COLUMN \`isDeleted\` tinyint NOT NULL DEFAULT 0
  `);
  console.log('✅ Added isDeleted column to students table');
} catch (error) {
  if (error.message.includes('Duplicate column name')) {
    console.log('⚠️ isDeleted column already exists in students table');
  }
}
```

### 2. Manual Column Addition Script

Use the provided script for safe manual addition:

```bash
node add-isdeleted-to-students.js
```

This script:
- Checks if the column already exists
- Adds the column if missing
- Creates the performance index
- Provides clear feedback

### 3. Manual SQL Execution

If you need to run SQL directly:

```sql
-- First check if column exists
SHOW COLUMNS FROM `students` LIKE 'isDeleted';

-- If column doesn't exist, add it
ALTER TABLE `students` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add index for performance
CREATE INDEX `IDX_students_isdeleted` ON `students` (`isDeleted`);
```

### 4. Alternative Safe SQL Pattern

For production scripts, use this pattern:

```sql
-- Safe column addition (MySQL compatible)
SET @sql = CONCAT('ALTER TABLE `students` ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0');
SET @sql_exists = CONCAT('SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS ',
                         'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "students" AND COLUMN_NAME = "isDeleted"');
PREPARE stmt_exists FROM @sql_exists;
EXECUTE stmt_exists;
DEALLOCATE PREPARE stmt_exists;

SET @sql = IF(@col_exists = 0, @sql, 'SELECT "Column already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

## Database-Specific Syntax

### MySQL
- ❌ `ALTER TABLE table ADD COLUMN IF NOT EXISTS column...` (Not supported)
- ✅ `ALTER TABLE table ADD COLUMN column...` (With error handling)

### MariaDB  
- ✅ `ALTER TABLE table ADD COLUMN IF NOT EXISTS column...` (Supported)

### PostgreSQL
- ✅ `ALTER TABLE table ADD COLUMN IF NOT EXISTS column...` (Supported)

### SQLite
- ✅ `ALTER TABLE table ADD COLUMN column...` (Limited support)

## Migration Strategy for MySQL

### For New Installations
1. Run: `npm run migration:run`
2. The migration handles errors gracefully
3. Check: `node verify-roles.js`

### For Existing Installations with Issues
1. Run: `node add-isdeleted-to-students.js`
2. This safely adds the missing column
3. Verify: `node check-isdeleted-column.js`

### For Manual Database Setup
1. Use the safe SQL patterns above
2. Or use the Node.js scripts provided
3. Avoid direct `IF NOT EXISTS` in ALTER TABLE statements

## Testing MySQL Compatibility

### Check Your MySQL Version
```sql
SELECT VERSION();
```

### Test Column Addition
```bash
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_db'
}).then(conn => {
  return conn.execute('SHOW COLUMNS FROM \`students\` LIKE \`isDeleted\`');
}).then(([rows]) => {
  console.log('isDeleted column exists:', rows.length > 0);
  process.exit(0);
}).catch(console.error);
"
```

## Best Practices

1. **Always use try-catch** for ALTER TABLE statements in MySQL
2. **Check first, then add** - verify column existence before addition
3. **Use scripts for safety** - let Node.js handle the complexity
4. **Test in development** - ensure compatibility before production
5. **Document your database version** - note MySQL vs MariaDB differences

## Quick Fix Commands

If you encounter the MySQL syntax error:

```bash
# Option 1: Use the safe script
node add-isdeleted-to-students.js

# Option 2: Run migration (now with error handling)
npm run migration:run

# Option 3: Verify current status
node check-isdeleted-column.js
```

The updated migration and scripts now handle MySQL's syntax limitations gracefully!