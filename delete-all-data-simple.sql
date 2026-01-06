-- Delete all data from all tables
SET FOREIGN_KEY_CHECKS = 0;

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
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM roles;

SET FOREIGN_KEY_CHECKS = 1;