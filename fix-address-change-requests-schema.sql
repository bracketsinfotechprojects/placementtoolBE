-- Fix address_change_requests table schema
-- Add missing columns that exist in the entity but not in the current table

-- Check if columns exist before adding them
SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'address_change_requests' 
        AND COLUMN_NAME = 'reviewed_at'
    ),
    'ALTER TABLE `address_change_requests` ADD COLUMN `reviewed_at` TIMESTAMP NULL AFTER `status`',
    'SELECT "reviewed_at column already exists" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'address_change_requests' 
        AND COLUMN_NAME = 'reviewed_by'
    ),
    'ALTER TABLE `address_change_requests` ADD COLUMN `reviewed_by` VARCHAR(100) NULL AFTER `reviewed_at`',
    'SELECT "reviewed_by column already exists" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'address_change_requests' 
        AND COLUMN_NAME = 'review_comments'
    ),
    'ALTER TABLE `address_change_requests` ADD COLUMN `review_comments` TEXT NULL AFTER `reviewed_by`',
    'SELECT "review_comments column already exists" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Also ensure status column has the correct ENUM constraint if it's currently just VARCHAR
SET @sql = IF(
    EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'address_change_requests' 
        AND COLUMN_NAME = 'status'
        AND DATA_TYPE = 'varchar'
    ),
    'ALTER TABLE `address_change_requests` MODIFY COLUMN `status` ENUM(''pending'',''approved'',''rejected'',''implemented'') NOT NULL DEFAULT ''pending''',
    'SELECT "status column already has correct enum type" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the final table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'address_change_requests'
ORDER BY ORDINAL_POSITION;