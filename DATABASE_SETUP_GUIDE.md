# Complete Database Setup Guide

This guide provides comprehensive instructions for setting up the CRM database using the provided migration and schema files.

## Overview

The database setup consists of creating a complete schema for a Student CRM system with the following components:

- **User Management**: Roles, Users, and User-Role assignments
- **Student Core Data**: Student profiles, contact details, visa information, and addresses
- **Student Status Tracking**: Eligibility status and lifestyle information
- **Facility & Job Management**: Facility records, address change requests, and job status updates

## Database Schema Components

### Core Tables Created

1. **User System**:
   - `roles` - User role definitions
   - `users` - User account information
   - `user_roles` - Many-to-many relationship between users and roles

2. **Student Core**:
   - `students` - Main student records
   - `contact_details` - Student contact information
   - `visa_details` - Student visa information
   - `addresses` - Student address information

3. **Student Status & Lifestyle**:
   - `eligibility_status` - Student eligibility tracking
   - `student_lifestyle` - Student lifestyle preferences
   - `placement_preferences` - Student placement preferences

4. **Facility & Job Tracking**:
   - `facility_records` - Facility applications and records
   - `address_change_requests` - Address change tracking
   - `job_status_updates` - Job search status tracking

## Setup Methods

### Method 1: Using TypeScript Migration (Recommended)

This method uses the TypeScript migration file which provides programmatic database setup.

#### Prerequisites

1. Ensure Node.js and TypeScript are installed
2. Configure database connection in your environment variables
3. Install required dependencies

#### Steps

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure Database Connection**:
   Set up your `.env` file with database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=your_database_name
   ```

3. **Run the Migration**:
   ```bash
   # If you have a migration runner
   npm run migration:run

   # Or run the TypeScript file directly
   npx ts-node src/migrations/1704205700000-MasterCreateCompleteDatabaseSchema.ts
   ```

4. **Verify Setup**:
   ```bash
   # Check if tables were created
   node verify-setup.js
   ```

### Method 2: Using SQL Schema File

This method uses the direct SQL schema file for database setup.

#### Steps

1. **Connect to MySQL**:
   ```bash
   mysql -u your_username -p
   ```

2. **Create Database** (if not exists):
   ```sql
   CREATE DATABASE IF NOT EXISTS your_database_name;
   USE your_database_name;
   ```

3. **Execute Schema File**:
   ```bash
   # From command line
   mysql -u your_username -p your_database_name < src/database/complete-database-schema.sql

   # Or from MySQL console
   source /path/to/your/project/src/database/complete-database-schema.sql;
   ```

4. **Verify Setup**:
   ```sql
   -- Check tables were created
   SHOW TABLES;

   -- Verify table structures
   DESCRIBE students;
   DESCRIBE users;
   DESCRIBE roles;
   -- ... and so on for other tables
   ```

## Table Structures

### User Management Tables

#### roles
```sql
- role_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- role_name (VARCHAR(50), UNIQUE, NOT NULL)
- isDeleted (TINYINT, DEFAULT 0)
- created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- updatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

#### users
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- loginID (VARCHAR(100), UNIQUE, NOT NULL)
- password (VARCHAR(255), NOT NULL)
- userRole (VARCHAR(50), DEFAULT 'user')
- status (VARCHAR(20), DEFAULT 'active')
- isDeleted (TINYINT, DEFAULT 0)
- created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- updatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

#### user_roles
```sql
- user_id (INT, FOREIGN KEY to users.id)
- role_id (INT, FOREIGN KEY to roles.role_id)
- created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- PRIMARY KEY (user_id, role_id)
```

### Student Core Tables

#### students
```sql
- student_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- first_name (VARCHAR(100), NOT NULL)
- last_name (VARCHAR(100), NOT NULL)
- dob (DATE, NOT NULL)
- gender (VARCHAR(20))
- nationality (VARCHAR(50))
- student_type (VARCHAR(50))
- status (ENUM: 'active','inactive','graduated','withdrawn', DEFAULT 'active')
- isDeleted (TINYINT, DEFAULT 0)
- createdAt (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- updatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

#### contact_details
```sql
- contact_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- primary_mobile (VARCHAR(20))
- email (VARCHAR(150))
- emergency_contact (VARCHAR(20))
- contact_type (ENUM: 'mobile','landline','whatsapp', DEFAULT 'mobile')
- is_primary (TINYINT, DEFAULT 1)
- verified_at (TIMESTAMP)
```

#### visa_details
```sql
- visa_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- visa_type (VARCHAR(50))
- visa_number (VARCHAR(50))
- start_date (DATE)
- expiry_date (DATE)
- status (ENUM: 'active','expired','revoked','pending', DEFAULT 'active')
- issuing_country (VARCHAR(100))
- document_path (VARCHAR(255))
```

#### addresses
```sql
- address_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- line1 (VARCHAR(255))
- city (VARCHAR(100))
- state (VARCHAR(100))
- country (VARCHAR(100))
- postal_code (VARCHAR(20))
- address_type (ENUM: 'current','permanent','temporary','mailing', DEFAULT 'current')
- is_primary (TINYINT, DEFAULT 0)
```

### Student Status & Lifestyle Tables

#### eligibility_status
```sql
- status_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- classes_completed (TINYINT)
- fees_paid (TINYINT)
- assignments_submitted (TINYINT)
- documents_submitted (TINYINT)
- trainer_consent (TINYINT)
- override_requested (TINYINT)
- requested_by (VARCHAR(100))
- reason (VARCHAR(255))
- comments (TEXT)
- overall_status (ENUM: 'eligible','not_eligible','pending','override', DEFAULT 'not_eligible')
- isDeleted (TINYINT, DEFAULT 0)
- created_at (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- updatedAt (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

#### student_lifestyle
```sql
- lifestyle_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- currently_working (TINYINT)
- working_hours (VARCHAR(50))
- has_dependents (TINYINT)
- married (TINYINT)
- driving_license (TINYINT)
- own_vehicle (TINYINT)
- public_transport_only (TINYINT)
- can_travel_long_distance (TINYINT)
- drop_support_available (TINYINT)
- fully_flexible (TINYINT)
- rush_placement_required (TINYINT)
- preferred_days (VARCHAR(100))
- preferred_time_slots (VARCHAR(100))
- additional_notes (TEXT)
```

#### placement_preferences
```sql
- preference_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- preferred_states (VARCHAR(100))
- preferred_cities (VARCHAR(255))
- max_travel_distance_km (INT)
- morning_only (TINYINT)
- evening_only (TINYINT)
- night_shift (TINYINT)
- weekend_only (TINYINT)
- part_time (TINYINT)
- full_time (TINYINT)
- with_friend (TINYINT)
- friend_name_or_id (VARCHAR(100))
- with_spouse (TINYINT)
- spouse_name_or_id (VARCHAR(100))
- earliest_start_date (DATE)
- latest_start_date (DATE)
- specific_month_preference (VARCHAR(50))
- urgency_level (ENUM: 'immediate','within_month','within_quarter','flexible', DEFAULT 'flexible')
- additional_preferences (TEXT)
```

### Facility & Job Tracking Tables

#### facility_records
```sql
- facility_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- facility_name (VARCHAR(100))
- facility_type (VARCHAR(50))
- branch_site (VARCHAR(100))
- facility_address (VARCHAR(255))
- contact_person_name (VARCHAR(100))
- contact_email (VARCHAR(150))
- contact_phone (VARCHAR(20))
- supervisor_name (VARCHAR(100))
- distance_from_student_km (INT)
- slot_id (VARCHAR(50))
- course_type (VARCHAR(100))
- shift_timing (VARCHAR(50))
- start_date (DATE)
- duration_hours (INT)
- gender_requirement (VARCHAR(20))
- applied_on (DATE)
- student_confirmed (TINYINT)
- student_comments (TEXT)
- document_type (VARCHAR(100))
- file_path (VARCHAR(255))
- application_status (ENUM: 'applied','under_review','accepted','rejected','confirmed','completed', DEFAULT 'applied')
```

#### address_change_requests
```sql
- acr_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- current_address (VARCHAR(255))
- new_address (VARCHAR(255))
- effective_date (DATE)
- change_reason (VARCHAR(255))
- impact_acknowledged (TINYINT)
- status (ENUM: 'pending','approved','rejected','implemented', DEFAULT 'pending')
- reviewed_at (TIMESTAMP)
- reviewed_by (VARCHAR(100))
- review_comments (TEXT)
```

#### job_status_updates
```sql
- jsu_id (INT, PRIMARY KEY, AUTO_INCREMENT)
- student_id (INT, FOREIGN KEY to students.student_id)
- status (VARCHAR(50), NOT NULL)
- last_updated_on (DATE, NOT NULL)
- employer_name (VARCHAR(100))
- job_role (VARCHAR(100))
- start_date (DATE)
- employment_type (VARCHAR(50))
- offer_letter_path (VARCHAR(255))
- actively_applying (TINYINT)
- expected_timeline (VARCHAR(100))
- searching_comments (TEXT)
- created_at (TIMESTAMP)
```

## Default Data

The schema includes default roles:
- Admin
- Facility
- Supervisor
- Placement Executive
- Trainer
- Student

## Indexes and Performance

The schema includes several indexes for optimal performance:
- Foreign key indexes on all relationship columns
- Unique indexes on email and visa_number
- Composite indexes for common query patterns
- Indexes on isDeleted columns for soft delete queries

## Verification Scripts

### Check Database Setup
```bash
node verify-setup.js
```

### Check Specific Tables
```sql
-- Verify all tables exist
SHOW TABLES;

-- Check table structures
DESCRIBE students;
DESCRIBE users;
DESCRIBE roles;

-- Verify default roles
SELECT * FROM roles;
```

### Check Data Integrity
```sql
-- Verify foreign key relationships
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'your_database_name';

-- Check indexes
SHOW INDEX FROM students;
SHOW INDEX FROM users;
```

## Troubleshooting

### Common Issues

1. **Migration Fails**:
   - Check database connection credentials
   - Ensure MySQL/MariaDB is running
   - Verify database permissions

2. **Foreign Key Errors**:
   - Ensure tables are created in correct order
   - Check for circular dependencies

3. **Character Set Issues**:
   ```sql
   ALTER DATABASE your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Permission Errors**:
   ```sql
   GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Reset Database
If you need to start fresh:
```sql
-- Drop all tables (in reverse dependency order)
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

## Next Steps

After successful setup:

1. **Configure Application**: Update your application configuration to use the database
2. **Set Up Authentication**: Implement user authentication and authorization
3. **Create API Endpoints**: Develop REST APIs for CRUD operations
4. **Add Business Logic**: Implement core business processes
5. **Set Up Testing**: Create unit and integration tests
6. **Monitor Performance**: Set up database monitoring and optimization

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Ensure database server is properly configured
4. Check application logs for detailed error messages

---

**Last Updated**: January 3, 2026  
**Database Version**: Complete Schema v1.0  
**Compatibility**: MySQL 5.7+, MariaDB 10.2+