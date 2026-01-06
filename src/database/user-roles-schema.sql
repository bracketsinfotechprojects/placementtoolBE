-- User Roles Management System Database Schema
-- This file contains the SQL queries for creating the user roles, users, and user_roles tables

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    isDeleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active','inactive','locked') DEFAULT 'active',
    isDeleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT,
    role_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Add isDeleted column to students table
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE
-- This will fail if column already exists, which is expected behavior
ALTER TABLE students 
ADD COLUMN isDeleted TINYINT NOT NULL DEFAULT 0;

-- Insert default roles only if table is empty
INSERT INTO roles (role_name) 
SELECT 'Admin' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'Admin')
UNION ALL
SELECT 'Facility' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'Facility')
UNION ALL
SELECT 'Supervisor' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'Supervisor')
UNION ALL
SELECT 'Placement Executive' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'Placement Executive')
UNION ALL
SELECT 'Trainer' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'Trainer')
UNION ALL
SELECT 'Student' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'Student');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_isdeleted ON users(isDeleted);
CREATE INDEX IF NOT EXISTS idx_roles_role_name ON roles(role_name);
CREATE INDEX IF NOT EXISTS idx_roles_isdeleted ON roles(isDeleted);
CREATE INDEX idx_students_isdeleted ON students(isDeleted);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);