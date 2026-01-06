# Migration Execution Guide

## Why Migrations Don't Run Automatically

**Migrations do NOT run automatically when the server starts.** This is by design to give you control over when database changes are applied.

## Available Migration Commands

This project provides several ways to run migrations:

### 1. TypeORM CLI Commands (Recommended)

```bash
# Run all pending migrations
npm run migration:run

# Run specific migration (if needed)
npm run migration:run -- --src/migrations/1704205500000-AddIsDeletedColumn.ts

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- -n MigrationName
```

### 2. Custom Database Setup Scripts

```bash
# Run migrations using custom script
npm run db:migrate

# Revert migrations
npm run db:revert

# View available database commands
npm run db:help
```

### 3. Fix Individual Column Issues

If you encounter specific column errors, use the targeted fix scripts:

```bash
# Fix isDeleted columns
node add-isdeleted-to-students.js

# Fix overall_status column  
node fix-overall-status.js

# Check system status
node check-isdeleted-column.js
node verify-roles.js
```

## How to Run the isDeleted Column Migration

### Step 1: Run All Migrations
```bash
npm run migration:run
```

This will execute all pending migrations in order:
- User roles system (roles, users, user_roles tables)
- isDeleted columns for soft delete support
- Missing columns for student-related tables (overall_status)
- Default role seeding
- Performance indexes

**Note**: All column issues have been addressed in the migration sequence.

### Step 2: Verify the Migration Worked
```bash
node check-isdeleted-column.js
```

### Step 3: Test the Application
Try adding a student again to confirm the error is resolved.

## Migration Execution Process

1. **Create Migration File**: ✅ (Already done)
   - Migration files are created in `src/migrations/` with timestamp naming

2. **Run Migration Command**: ⏳ (You need to do this)
   ```bash
   npm run migration:run
   ```

3. **Database Schema Updated**: ✅ (Happens automatically)
   - TypeORM executes the `up()` method in your migration
   - New columns/tables are added to the database

4. **Application Restart** (if needed): ⏳ (May be required)
   - Some changes require restarting the server
   - Not always necessary for schema changes

## Troubleshooting Migration Issues

### Migration Not Found
If you get "migration not found" errors:
```bash
# Make sure you're in the right directory
cd /path/to/your/project

# Check if migration file exists
ls src/migrations/1704205500000-AddIsDeletedColumn.ts
```

### Database Connection Issues
```bash
# Check your environment variables
echo $DB_HOST
echo $DB_USER
echo $DB_NAME

# Test database connection
node -e "console.log('Testing connection...')"
```

### Permission Errors
Ensure your database user has:
- ALTER privileges (for adding columns)
- CREATE privileges (for creating tables)
- INSERT privileges (for seeding data)

### Migration Already Applied
If you get "migration already applied" errors, this is normal and safe to ignore.

## Manual SQL Execution (Alternative)

If the migration command doesn't work, you can run the SQL directly:

```sql
-- Execute each ALTER TABLE statement manually
ALTER TABLE `students` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

ALTER TABLE `users` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

ALTER TABLE `roles` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add indexes for performance
CREATE INDEX idx_students_isdeleted ON students(isDeleted);
CREATE INDEX idx_users_isdeleted ON users(isDeleted);
CREATE INDEX idx_roles_isdeleted ON roles(isDeleted);
```

## Development Workflow

### When Creating New Features
1. Make code changes
2. Create migration for database changes
3. Test locally by running migration
4. Commit both code and migration
5. Deploy and run migration on production

### When Deploying
1. Deploy code changes
2. Run migrations on production database
3. Restart application (if needed)

## Environment-Specific Considerations

### Development
```bash
# Safe to run migrations frequently
npm run migration:run
```

### Production
```bash
# Always backup database first
# Then run migrations during maintenance window
npm run migration:run
```

## Common Migration Commands Summary

| Command | Purpose |
|---------|---------|
| `npm run migration:run` | Execute all pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run db:migrate` | Alternative migration command |
| `node check-isdeleted-column.js` | Verify isDeleted column fix |
| `node verify-roles.js` | Check if roles were inserted |