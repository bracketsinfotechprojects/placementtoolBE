-- Clear All Data Script
-- This script deletes all data from all tables while preserving table structure
-- Useful for testing or resetting the database

-- Disable foreign key checks to avoid constraint errors during deletion
SET FOREIGN_KEY_CHECKS = 0;

-- Clear data from all tables (in reverse dependency order)

-- Clear student-related data first
DELETE FROM job_status_updates;
DELETE FROM address_change_requests;
DELETE FROM facility_records;
DELETE FROM placement_preferences;
DELETE FROM student_lifestyle;
DELETE FROM eligibility_status;
DELETE FROM addresses;
DELETE FROM visa_details;
DELETE FROM contact_details;
DELETE FROM students;

-- Clear user system data
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM roles;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify tables are empty
SELECT 'Data cleared successfully' as message;

-- Optional: Show table row counts
SELECT 'job_status_updates' as table_name, COUNT(*) as row_count FROM job_status_updates
UNION ALL
SELECT 'address_change_requests', COUNT(*) FROM address_change_requests
UNION ALL
SELECT 'facility_records', COUNT(*) FROM facility_records
UNION ALL
SELECT 'placement_preferences', COUNT(*) FROM placement_preferences
UNION ALL
SELECT 'student_lifestyle', COUNT(*) FROM student_lifestyle
UNION ALL
SELECT 'eligibility_status', COUNT(*) FROM eligibility_status
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'visa_details', COUNT(*) FROM visa_details
UNION ALL
SELECT 'contact_details', COUNT(*) FROM contact_details
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'roles', COUNT(*) FROM roles;