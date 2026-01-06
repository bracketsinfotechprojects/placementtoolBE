# Migration Setup Instructions

## ✅ Migration Cleanup Complete

All old migration files have been removed. You now have a **clean, single migration**:

```
src/migrations/
└── 1704205800000-CompleteEntityMatchingSchema.ts  ✅ ONLY FILE
```

## 🚀 How to Run on Fresh Database

### Step 1: Create Fresh Database

```bash
# Option A: Using MySQL commands
mysql -u your_username -p -e "DROP DATABASE IF EXISTS your_database_name;"
mysql -u your_username -p -e "CREATE DATABASE your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Option B: Using your database client
# - Drop existing database (if exists)
# - Create new database with UTF8MB4 character set
```

### Step 2: Run the Migration

**For TypeORM projects:**
```bash
npm run migration:run
# or
yarn migration:run
```

**For direct SQL (alternative):**
```bash
mysql -u your_username -p your_database_name < complete-entity-matching-schema.sql
```

### Step 3: Verify Success

**Check that all tables were created:**
```sql
SHOW TABLES;
```

Expected tables (13 total):
- roles
- users  
- user_roles
- students
- contact_details
- visa_details
- addresses
- eligibility_status
- student_lifestyle
- placement_preferences
- facility_records
- address_change_requests
- job_status_updates

**Test the original failing query:**
```sql
-- This should now work without "Unknown column" errors
INSERT INTO address_change_requests (
  acr_id, student_id, current_address, new_address, 
  effective_date, change_reason, impact_acknowledged, 
  status, reviewed_at, reviewed_by, review_comments
) VALUES (
  DEFAULT, 1, '123 Old St', '456 New Ave', '2024-05-01', 
  'Test reason', true, 'pending', NOW(), 'Test Reviewer', 'Test comment'
);
```

## 🎯 What This Migration Creates

### Complete Schema Matching Your Entities:
- ✅ All 13 tables with correct structure
- ✅ All foreign key relationships
- ✅ All indexes for performance
- ✅ Default roles seeded
- ✅ Perfect entity-database alignment

### Key Features:
- **Self-contained**: No dependencies on other migrations
- **Complete**: Creates entire schema from scratch
- **Entity-matched**: Every entity field has corresponding column
- **Production-ready**: Proper constraints and indexes

## 🔧 Troubleshooting

### If Migration Fails:

1. **Check database permissions:**
   ```sql
   SHOW GRANTS FOR 'your_username'@'localhost';
   -- Should include CREATE, ALTER, INSERT, SELECT, UPDATE, DELETE
   ```

2. **Verify character set:**
   ```sql
   SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
   FROM information_schema.SCHEMATA 
   WHERE SCHEMA_NAME = 'your_database_name';
   -- Should be utf8mb4 / utf8mb4_unicode_ci
   ```

3. **Check TypeORM configuration:**
   ```javascript
   // In ormconfig.js or data-source.ts
   {
     type: 'mysql',
     host: process.env.DB_HOST,
     username: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
     entities: ['src/entities/*.entity{.ts,.js}'],
     migrations: ['src/migrations/*{.ts,.js}'],
     cli: { migrationsDir: 'src/migrations' }
   }
   ```

### If Tables Don't Match Expected Structure:

Run the verification script:
```bash
node test-complete-migration.js
```

This will check:
- All tables exist
- All required columns exist  
- Foreign key relationships work
- INSERT operations succeed

## ✅ Success Confirmation

You'll know it worked when:
1. ✅ All 13 tables appear in `SHOW TABLES`
2. ✅ The test INSERT query succeeds without errors
3. ✅ `test-complete-migration.js` reports "ALL TESTS PASSED"
4. ✅ Your TypeORM entities work without column errors

## 🎉 You're Ready!

Your CRM application now has a solid, maintainable database foundation that perfectly matches your TypeORM entities. No more "Unknown column" errors!

---

**Note**: This single migration replaces multiple incomplete migrations and provides a clean, professional database setup process.