-- Verify that new fields exist in the database tables

-- Check contact_details table
DESCRIBE contact_details;

-- Check visa_details table
DESCRIBE visa_details;

-- Check addresses table
DESCRIBE addresses;

-- Check eligibility_status table
DESCRIBE eligibility_status;

-- Alternative: Check if specific columns exist
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'contact_details' 
  AND COLUMN_NAME IN ('alternate_contact', 'emergency_contact_name', 'relationship');

SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'visa_details' 
  AND COLUMN_NAME = 'work_limitation';

SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'addresses' 
  AND COLUMN_NAME IN ('line2', 'suburb');

SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'eligibility_status' 
  AND COLUMN_NAME = 'manual_override';
