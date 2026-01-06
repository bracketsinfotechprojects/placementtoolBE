-- Add isDeleted columns to support soft delete functionality
-- This script adds the missing isDeleted columns that are referenced in the application code

-- Add isDeleted column to students table
ALTER TABLE `students` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add isDeleted column to users table  
ALTER TABLE `users` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add isDeleted column to roles table
ALTER TABLE `roles` 
ADD COLUMN `isDeleted` tinyint NOT NULL DEFAULT 0;

-- Add indexes for better performance on isDeleted queries
CREATE INDEX idx_students_isdeleted ON students(isDeleted);
CREATE INDEX idx_users_isdeleted ON users(isDeleted);
CREATE INDEX idx_roles_isdeleted ON roles(isDeleted);