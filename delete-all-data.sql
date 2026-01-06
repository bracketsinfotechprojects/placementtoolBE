-- =============================================================================
-- COMPREHENSIVE DATABASE DATA CLEARING SCRIPT
-- =============================================================================
-- This script deletes ALL data from all tables while preserving table structure
-- Useful for testing, resetting, or preparing the database for fresh data
-- 
-- Created: 2026-01-03
-- Database: CRM Application
-- =============================================================================

-- =============================================================================
-- STEP 1: DISABLE CONSTRAINTS AND SETTINGS
-- =============================================================================

-- Disable foreign key checks to avoid constraint errors during deletion
SET FOREIGN_KEY_CHECKS = 0;

-- Disable auto-commit for better performance on large datasets
SET AUTOCOMMIT = 0;

-- =============================================================================
-- STEP 2: CLEAR DATA IN DEPENDENCY ORDER (Child tables first)
-- =============================================================================

-- Clear student-related dependent tables first
DELETE FROM job_status_updates;
DELETE FROM address_change_requests;
DELETE FROM facility_records;
DELETE FROM placement_preferences;
DELETE FROM student_lifestyle;
DELETE FROM eligibility_status;

-- Clear contact and address information
DELETE FROM addresses;
DELETE FROM visa_details;
DELETE FROM contact_details;

-- Clear main student records
DELETE FROM students;

-- Clear user system junction table
DELETE FROM user_roles;

-- Clear user records
DELETE FROM users;

-- Clear role definitions
DELETE FROM roles;

-- =============================================================================
-- STEP 3: RESET AUTO-INCREMENT COUNTERS
-- =============================================================================

-- Reset auto-increment values to start from 1 for fresh data
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE contact_details AUTO_INCREMENT = 1;
ALTER TABLE visa_details AUTO_INCREMENT = 1;
ALTER TABLE addresses AUTO_INCREMENT = 1;
ALTER TABLE eligibility_status AUTO_INCREMENT = 1;
ALTER TABLE student_lifestyle AUTO_INCREMENT = 1;
ALTER TABLE placement_preferences AUTO_INCREMENT = 1;
ALTER TABLE facility_records AUTO_INCREMENT = 1;
ALTER TABLE address_change_requests AUTO_INCREMENT = 1;
ALTER TABLE job_status_updates AUTO_INCREMENT = 1;

-- =============================================================================
-- STEP 4: RE-ENABLE CONSTRAINTS AND SETTINGS
-- =============================================================================

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Re-enable auto-commit
SET AUTOCOMMIT = 1;

-- =============================================================================
-- STEP 5: VERIFICATION AND SUMMARY
-- =============================================================================

-- Show summary of cleared data
SELECT 'DATA CLEARING COMPLETED' as status, NOW() as completed_at;

-- Display row counts for verification (all should be 0)
SELECT 'Table Row Counts After Clearing:' as verification_section;

SELECT 'roles' as table_name, COUNT(*) as row_count FROM roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'contact_details', COUNT(*) FROM contact_details
UNION ALL
SELECT 'visa_details', COUNT(*) FROM visa_details
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'eligibility_status', COUNT(*) FROM eligibility_status
UNION ALL
SELECT 'student_lifestyle', COUNT(*) FROM student_lifestyle
UNION ALL
SELECT 'placement_preferences', COUNT(*) FROM placement_preferences
UNION ALL
SELECT 'facility_records', COUNT(*) FROM facility_records
UNION ALL
SELECT 'address_change_requests', COUNT(*) FROM address_change_requests
UNION ALL
SELECT 'job_status_updates', COUNT(*) FROM job_status_updates
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

SELECT 'All database tables have been successfully cleared of data' as final_message,
       'Table structures preserved and ready for fresh data' as note,
       NOW() as completed_at;