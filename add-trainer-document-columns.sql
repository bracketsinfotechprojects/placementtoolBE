-- Add document path columns to Trainer table
-- Run this SQL script directly in your MySQL client or command line

USE testcrm;

-- Add wwc_document column
ALTER TABLE `Trainer` 
ADD COLUMN `wwc_document` varchar(255) NULL 
COMMENT 'Path to Working With Children Check document file'
AFTER `wwc_expiry_date`;

-- Add police_check_document column
ALTER TABLE `Trainer` 
ADD COLUMN `police_check_document` varchar(255) NULL 
COMMENT 'Path to Police Check document file'
AFTER `police_check_expiry_date`;

-- Verify the columns were added
DESCRIBE `Trainer`;

-- Show success message
SELECT 'Columns added successfully!' AS Status;
