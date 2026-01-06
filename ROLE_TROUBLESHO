# Role Management Troubleshooting Scripts

This directory contains utility scripts to help debug and resolve issues with the user roles system.

## Available Scripts

### 1. verify-roles.js
Checks if the roles table exists and displays current roles in the database.

**Usage:**
```bash
node verify-roles.js
```

**What it does:**
- Connects to the database
- Checks if the roles table exists
- Lists all current roles with their IDs and creation dates
- Provides clear status messages

### 2. insert-default-roles.js
Manually inserts the default roles if the migration didn't work properly.

**Usage:**
```bash
node insert-default-roles.js
```

**What it does:**
- Checks if the roles table exists
- If no roles exist, inserts the default roles:
  - Admin
  - Facility  
  - Supervisor
  - Placement Executive
  - Trainer
  - Student
- Uses INSERT IGNORE to prevent duplicates
- Provides detailed feedback about the insertion process

## Database Configuration

Both scripts use the following environment variables for database connection:

```bash
DB_HOST=localhost          # Database host
DB_PORT=3306              # Database port
DB_USER=root              # Database username  
DB_PASSWORD=              # Database password
DB_NAME=crm_db            # Database name
```

If these environment variables are not set, the scripts use default values.

## Troubleshooting Steps

If you're having issues with role insertion:

1. **Run the migration first:**
   ```bash
   npm run migration:run
   ```

2. **Verify roles were inserted:**
   ```bash
   node verify-roles.js
   ```

3. **If roles are missing, manually insert them:**
   ```bash
   node insert-default-roles.js
   ```

4. **Verify again:**
   ```bash
   node verify-roles.js
   ```

## Expected Output

### Successful verification should show:
```
✅ Connected to database

📋 Current roles in database:
========================================
1. ID: 1 | Name: Admin | Created: 2024-01-03T14:44:25.000Z
2. ID: 2 | Name: Facility | Created: 2024-01-03T14:44:25.000Z
3. ID: 3 | Name: Supervisor | Created: 2024-01-03T14:44:25.000Z
4. ID: 4 | Name: Placement Executive | Created: 2024-01-03T14:44:25.000Z
5. ID: 5 | Name: Trainer | Created: 2024-01-03T14:44:25.000Z
6. ID: 6 | Name: Student | Created: 2024-01-03T14:44:25.000Z

✅ Found 6 roles in the database

✅ The roles table exists
```

## Common Issues and Solutions

### "Table doesn't exist"
- Run the migration: `npm run migration:run`

### "No roles found"  
- Run the manual insertion script: `node insert-default-roles.js`

### Connection errors
- Check your database environment variables
- Ensure your database server is running
- Verify database credentials