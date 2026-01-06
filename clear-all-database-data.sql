-- ================================================
-- COMPREHENSIVE DATABASE DATA CLEARING SCRIPT
-- ================================================
-- This script removes ALL data from all tables while preserving the table structure
-- Use with caution - this action cannot be undone!
-- ================================================

-- Disable foreign key checks to allow truncation in any order
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- CLEAR ALL USER & ROLE SYSTEM DATA
-- ================================================
TRUNCATE TABLE IF EXISTS `user_roles`;
TRUNCATE TABLE IF EXISTS `users`;
TRUNCATE TABLE IF EXISTS `roles`;

-- ================================================
-- CLEAR ALL STUDENT CORE DATA (Child tables first)
-- ================================================
TRUNCATE TABLE IF EXISTS `job_status_updates`;
TRUNCATE TABLE IF EXISTS `address_change_requests`;
TRUNCATE TABLE IF EXISTS `facility_records`;
TRUNCATE TABLE IF EXISTS `placement_preferences`;
TRUNCATE TABLE IF EXISTS `student_lifestyle`;
TRUNCATE TABLE IF EXISTS `eligibility_status`;
TRUNCATE TABLE IF EXISTS `addresses`;
TRUNCATE TABLE IF EXISTS `visa_details`;
TRUNCATE TABLE IF EXISTS `contact_details`;

-- ================================================
-- CLEAR MAIN STUDENT DATA
-- ================================================
TRUNCATE TABLE IF EXISTS `students`;

-- ================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
SELECT 'Data clearing completed' AS status;

-- Show row counts for all tables (should be 0)
SELECT 
    'users' AS table_name, 
    COUNT(*) AS row_count 
FROM `users`
UNION ALL
SELECT 
    'roles' AS table_name, 
    COUNT(*) AS row_count 
FROM `roles`
UNION ALL
SELECT 
    'user_roles' AS table_name, 
    COUNT(*) AS row_count 
FROM `user_roles`
UNION ALL
SELECT 
    'students' AS table_name, 
    COUNT(*) AS row_count 
FROM `students`
UNION ALL
SELECT 
    'contact_details' AS table_name, 
    COUNT(*) AS row_count 
FROM `contact_details`
UNION ALL
SELECT 
    'visa_details' AS table_name, 
    COUNT(*) AS row_count 
FROM `visa_details`
UNION ALL
SELECT 
    'addresses' AS table_name, 
    COUNT(*) AS row_count 
FROM `addresses`
UNION ALL
SELECT 
    'eligibility_status' AS table_name, 
    COUNT(*) AS row_count 
FROM `eligibility_status`
UNION ALL
SELECT 
    'student_lifestyle' AS table_name, 
    COUNT(*) AS row_count 
FROM `student_lifestyle`
UNION ALL
SELECT 
    'placement_preferences' AS table_name, 
    COUNT(*) AS row_count 
FROM `placement_preferences`
UNION ALL
SELECT 
    'facility_records' AS table_name, 
    COUNT(*) AS row_count 
FROM `facility_records`
UNION ALL
SELECT 
    'address_change_requests' AS table_name, 
    COUNT(*) AS row_count 
FROM `address_change_requests`
UNION ALL
SELECT 
    'job_status_updates' AS table_name, 
    COUNT(*) AS row_count 
FROM `job_status_updates`
ORDER BY table_name;