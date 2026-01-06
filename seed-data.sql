-- Seed Data for CRM Database
-- This file contains INSERT statements for users, roles, and user_roles tables
-- Run this after applying the complete migration

-- ==============================================
-- ROLES SEED DATA
-- ==============================================

INSERT INTO roles (role_name) VALUES 
('Admin'),
('Facility'),
('Supervisor'),
('Placement Executive'),
('Trainer'),
('Student');

-- ==============================================
-- USERS SEED DATA
-- ==============================================

-- Note: In production, passwords should be properly hashed
-- All users use password 'test123' for testing/development
-- The hash below corresponds to 'test123'

INSERT INTO users (loginID, password, userRole, status) VALUES 
('admin', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'Admin', 'active'),
('facility_manager', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'Facility', 'active'),
('supervisor_john', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'Supervisor', 'active'),
('placement_executive', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'Placement Executive', 'active'),
('trainer_mary', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'Trainer', 'active'),
('student_demo', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'Student', 'active'),
('test_user', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'user', 'active'),
('inactive_user', '$2b$10$rOz9YH5Y8K5nN5K5nN5K5u', 'user', 'inactive');

-- ==============================================
-- USER_ROLES SEED DATA (Junction Table)
-- ==============================================

-- Admin user gets Admin role
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1);

-- Facility manager gets Facility role
INSERT INTO user_roles (user_id, role_id) VALUES 
(2, 2);

-- Supervisor gets Supervisor role  
INSERT INTO user_roles (user_id, role_id) VALUES 
(3, 3);

-- Placement executive gets Placement Executive role
INSERT INTO user_roles (user_id, role_id) VALUES 
(4, 4);

-- Trainer gets Trainer role
INSERT INTO user_roles (user_id, role_id) VALUES 
(5, 5);

-- Student user gets Student role
INSERT INTO user_roles (user_id, role_id) VALUES 
(6, 6);

-- Some users can have multiple roles (example: Admin can also be Trainer)
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 5); -- Admin user also has Trainer role

-- ==============================================
-- SAMPLE STUDENTS DATA (Optional - for testing)
-- ==============================================

-- Add some sample students for testing student-related functionality
INSERT INTO students (first_name, last_name, dob, gender, nationality, student_type, status) VALUES 
('John', 'Doe', '2000-05-15', 'Male', 'Canadian', 'domestic', 'active'),
('Jane', 'Smith', '1999-08-22', 'Female', 'International', 'international', 'active'),
('Mike', 'Johnson', '2001-02-10', 'Male', 'Canadian', 'domestic', 'active'),
('Sarah', 'Wilson', '2000-12-03', 'Female', 'International', 'international', 'active'),
('David', 'Brown', '1999-09-18', 'Male', 'Canadian', 'domestic', 'graduated');

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check if data was inserted correctly
SELECT 'ROLES' as table_name, COUNT(*) as record_count FROM roles
UNION ALL
SELECT 'USERS' as table_name, COUNT(*) as record_count FROM users  
UNION ALL
SELECT 'USER_ROLES' as table_name, COUNT(*) as record_count FROM user_roles
UNION ALL
SELECT 'STUDENTS' as table_name, COUNT(*) as record_count FROM students;

-- Display all users with their roles
SELECT 
    u.id,
    u.loginID,
    u.userRole,
    u.status,
    GROUP_CONCAT(r.role_name SEPARATOR ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
GROUP BY u.id, u.loginID, u.userRole, u.status
ORDER BY u.id;

-- Display users by role
SELECT 
    r.role_name,
    COUNT(ur.user_id) as user_count,
    GROUP_CONCAT(u.loginID SEPARATOR ', ') as users
FROM roles r
LEFT JOIN user_roles ur ON r.role_id = ur.role_id
LEFT JOIN users u ON ur.user_id = u.id
GROUP BY r.role_name
ORDER BY r.role_name;