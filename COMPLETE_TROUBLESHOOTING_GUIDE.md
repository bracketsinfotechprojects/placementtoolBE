# Complete Database Troubleshooting Guide

## Overview

This guide covers all common database setup issues and their solutions for the CRM application.

## Quick Reference

### Common Errors & Solutions

| Error | Solution |
|-------|----------|
| `Unknown column 'isDeleted'` | Run: `npm run migration:run` or `node add-isdeleted-to-students.js` |
| `Unknown column 'overall_status'` | Run: `npm run migration:run` or `node fix-overall-status.js` |
| `Table 'roles' already exists` | Safe to ignore, migration uses `IF NOT EXISTS` |
| `MySQL syntax error` | Use updated migration with try-catch blocks |

### Essential Commands

```bash
# Run all migrations
npm run migration:run

# Check system status
node verify-roles.js
node check-isdeleted-column.js
node fix-overall-status.js

# Manual fixes
node add-isdeleted-to-students.js
node insert-default-roles.js
```

## Detailed Solutions

### 1. Missing isDeleted Column Error

**Error**: `Unknown column 'isDeleted' in 'field list'`

**Cause**: Application code expects soft delete column that doesn't exist in database.

**Solution A - Run Migration**:
```bash
npm run migration:run
```

**Solution B - Manual Fix**:
```bash
node add-isdeleted-to-students.js
```

**Solution C - Manual SQL**:
```sql
ALTER TABLE `students` ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;
CREATE INDEX `IDX_students_isdeleted` ON `students` (`isDeleted`);
```

### 2. Missing overall_status Column Error

**Error**: `Unknown column 'overall_status' in 'field list'`

**Cause**: EligibilityStatus entity expects column missing from database schema.

**Solution A - Run Migration**:
```bash
npm run migration:run
```

**Solution B - Manual Fix**:
```bash
node fix-overall-status.js
```

**Solution C - Manual SQL**:
```sql
ALTER TABLE `eligibility_status` 
ADD COLUMN `overall_status` enum('eligible', 'not_eligible', 'pending', 'override') NOT NULL DEFAULT 'not_eligible';
```

### 3. MySQL Syntax Error

**Error**: `You have an error in your SQL syntax near 'IF NOT EXISTS'`

**Cause**: MySQL doesn't support `ADD COLUMN IF NOT EXISTS` syntax.

**Solution**: Use updated migration with try-catch error handling:
```bash
npm run migration:run
```

### 4. Table Already Exists Error

**Error**: `Table 'roles' already exists`

**Cause**: Migration tries to create tables that already exist.

**Solution**: This is expected behavior. The migration uses `IF NOT EXISTS` and will continue safely.

### 5. Migration Fails

**Error**: Migration command fails

**Causes & Solutions**:

#### Database Connection Issues
```bash
# Check environment variables
echo $DB_HOST $DB_USER $DB_NAME

# Test connection
node test-connection.js
```

#### Permission Issues
Ensure database user has:
- CREATE TABLE privileges
- ALTER privileges  
- INSERT privileges
- INDEX privileges

#### Foreign Key Constraints
```bash
# Run migrations in correct order
npm run migration:run

# Check existing table structure
node -e "console.log('Check manually in database')"
```

## Complete Setup Process

### For New Installations

1. **Environment Setup**:
   ```bash
   # Set environment variables
   export DB_HOST=localhost
   export DB_USER=your_user
   export DB_PASSWORD=your_password
   export DB_NAME=your_database
   ```

2. **Run Migrations**:
   ```bash
   npm run migration:run
   ```

3. **Verify Setup**:
   ```bash
   node verify-roles.js        # Should show 6 roles
   node check-isdeleted-column.js  # Should show columns exist
   node fix-overall-status.js  # Should show column added
   ```

4. **Test Application**:
   ```bash
   # Try adding a student
   curl -X POST http://localhost:3000/students \
        -H "Content-Type: application/json" \
        -d '{...}'
   ```

### For Existing Installations with Issues

1. **Diagnose Problems**:
   ```bash
   node verify-roles.js
   node check-isdeleted-column.js
   ```

2. **Fix Individual Issues**:
   ```bash
   node add-isdeleted-to-students.js
   node fix-overall-status.js
   node insert-default-roles.js
   ```

3. **Verify Fixes**:
   ```bash
   node check-isdeleted-column.js
   node verify-roles.js
   ```

## Database Schema Verification

### Check Tables Exist
```sql
SHOW TABLES LIKE 'students';
SHOW TABLES LIKE 'users';
SHOW TABLES LIKE 'roles';
SHOW TABLES LIKE 'eligibility_status';
```

### Check Columns Exist
```sql
SHOW COLUMNS FROM `students` LIKE 'isDeleted';
SHOW COLUMNS FROM `eligibility_status` LIKE 'overall_status';
SHOW COLUMNS FROM `users` LIKE 'isDeleted';
SHOW COLUMNS FROM `roles` LIKE 'isDeleted';
```

### Check Indexes Exist
```sql
SHOW INDEX FROM `students` WHERE Key_name = 'IDX_students_isdeleted';
SHOW INDEX FROM `eligibility_status` WHERE Key_name = 'IDX_eligibility_status_overall';
```

## Performance Optimization

### Verify Indexes
```sql
-- Check if important indexes exist
SHOW INDEX FROM `students`;
SHOW INDEX FROM `users`;
SHOW INDEX FROM `roles`;
```

### Add Missing Indexes (if needed)
```sql
CREATE INDEX `IDX_students_isdeleted` ON `students` (`isDeleted`);
CREATE INDEX `IDX_users_isdeleted` ON `users` (`isDeleted`);
CREATE INDEX `IDX_roles_isdeleted` ON `roles` (`isDeleted`);
CREATE INDEX `IDX_eligibility_status_overall` ON `eligibility_status` (`overall_status`);
```

## Rollback Procedures

### Revert Migrations
```bash
npm run migration:revert
```

### Manual Rollback (if needed)
```sql
-- Remove added columns
ALTER TABLE `eligibility_status` DROP COLUMN IF EXISTS `overall_status`;
ALTER TABLE `students` DROP COLUMN IF EXISTS `isDeleted`;
ALTER TABLE `users` DROP COLUMN IF EXISTS `isDeleted`;
ALTER TABLE `roles` DROP COLUMN IF EXISTS `isDeleted`;

-- Remove indexes
DROP INDEX IF EXISTS `IDX_students_isdeleted` ON `students`;
DROP INDEX IF EXISTS `IDX_eligibility_status_overall` ON `eligibility_status`;
```

## Monitoring & Maintenance

### Regular Health Checks
```bash
# Weekly system check
node verify-roles.js
node check-isdeleted-column.js

# After deployments
npm run migration:run --dry-run  # Check what would run
```

### Log Monitoring
```bash
# Check migration logs
tail -f logs/migration.log

# Check application logs for database errors
tail -f logs/app.log | grep -i "database\|sql\|column"
```

## Emergency Procedures

### Database Connection Lost
```bash
# Check database server status
systemctl status mysql

# Restart if needed
sudo systemctl restart mysql

# Test connection
node test-connection.js
```

### Migration Corruption
```bash
# Backup current state
mysqldump -u user -p database > backup.sql

# Reset to clean state
npm run migration:revert
npm run migration:run
```

### Data Recovery
```bash
# Restore from backup
mysql -u user -p database < backup.sql

# Verify data integrity
node verify-roles.js
```

## Getting Help

### Information to Collect
- Error messages (exact text)
- Database version (`SELECT VERSION();`)
- Migration logs
- Environment configuration
- Steps to reproduce

### Useful Diagnostic Commands
```bash
# System information
node --version
npm --version
mysql --version

# Database status
node test-connection.js

# Application status
npm run db:help

# File permissions
ls -la src/migrations/
```

## Prevention Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** in development environment first
3. **Monitor logs** during and after migrations
4. **Use environment variables** for database configuration
5. **Document schema changes** in migration files
6. **Run health checks** regularly

---

**Remember**: Most issues can be resolved by running `npm run migration:run` followed by the appropriate fix scripts!