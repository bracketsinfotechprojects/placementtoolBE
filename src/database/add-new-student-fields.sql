-- Add new fields to contact_details table
ALTER TABLE contact_details 
ADD COLUMN alternate_contact VARCHAR(20) NULL COMMENT 'Alternate contact number',
ADD COLUMN emergency_contact_name VARCHAR(100) NULL COMMENT 'Emergency contact person name',
ADD COLUMN relationship VARCHAR(50) NULL COMMENT 'Relationship with emergency contact';

-- Add new field to visa_details table
ALTER TABLE visa_details 
ADD COLUMN work_limitation TEXT NULL COMMENT 'Work limitations or restrictions on visa';

-- Add new fields to addresses table
ALTER TABLE addresses 
ADD COLUMN line2 VARCHAR(255) NULL COMMENT 'Address line 2',
ADD COLUMN suburb VARCHAR(100) NULL COMMENT 'Suburb';

-- Add new field to eligibility_status table
ALTER TABLE eligibility_status 
ADD COLUMN manual_override BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether manual override is applied';
