import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlacementSlotsTable1740000000000 implements MigrationInterface {
  name = 'CreatePlacementSlotsTable1740000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating placement_slots table...');

    // Create placement_slots table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`placement_slots\` (
        \`placementslot_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` varchar(255) NOT NULL COMMENT 'Foreign key to Facility table (stored as string)',

        -- Core slot details (multi-select fields stored as JSON arrays)
        \`placementslot_type\` json NULL COMMENT 'Type of placement slot (multi-select as JSON array)',
        \`course_applicable\` json NULL COMMENT 'Course applicable for this slot (multi-select as JSON array)',
        \`total_slots_offered\` int NULL COMMENT 'Total number of slots offered',
        \`placement_start_date\` date NULL COMMENT 'Placement start date',
        \`placement_end_date\` date NULL COMMENT 'Placement end date',
        \`total_hours_required\` int NULL COMMENT 'Total hours required for placement',
        \`expected_duration\` json NULL COMMENT 'Expected duration of placement (multi-select as JSON array)',
        \`shift_type\` json NULL COMMENT 'Type of shift (multi-select as JSON array)',
        \`shift_timings\` varchar(100) NULL COMMENT 'Specific shift timings',
        \`working_days\` json NULL COMMENT 'Working days pattern (multi-select as JSON array)',
        
        -- Requirements
        \`mandatory_courses\` json NULL COMMENT 'JSON array of mandatory courses required',
        \`documents_required\` json NULL COMMENT 'JSON array of required documents',
        \`allowed_visa_types\` varchar(100) NULL COMMENT 'Allowed visa types for this placement',
        \`work_hour_limit\` tinyint(1) NULL DEFAULT 0 COMMENT 'Whether there is a work hour limit',
        \`work_hour_limit_details\` text NULL COMMENT 'Details about work hour limitations',
        \`gender_preference\` json NULL COMMENT 'Gender preference for placement (multi-select as JSON array)',
        
        -- Rules & Expectations
        \`dress_code\` text NULL COMMENT 'Dress code requirements',
        \`attendance_rules\` text NULL COMMENT 'Attendance rules and requirements',
        \`leave_policy\` text NULL COMMENT 'Leave policy details',
        \`behaviour_expectations\` text NULL COMMENT 'Expected behavior and conduct',
        
        -- Commercials
        \`placement_fee\` varchar(50) NULL COMMENT 'Placement fee amount (stored as string)',
        \`placement_fee_status\` tinyint(1) NULL DEFAULT 0 COMMENT 'Whether placement fee is active/paid',
        \`invoice_required\` tinyint(1) NULL DEFAULT 0 COMMENT 'Whether invoice is required',
        \`special_commercial_terms\` text NULL COMMENT 'Special commercial terms and conditions',
        
        -- Constraints
        \`urgent_requirement\` tinyint(1) NULL DEFAULT 0 COMMENT 'Whether this is an urgent requirement',
        \`priority_category\` json NULL COMMENT 'Priority category for this slot (multi-select as JSON array)',
        \`restrictions\` text NULL COMMENT 'Any restrictions for this placement',
        \`not_comfortable_with\` text NULL COMMENT 'Things not comfortable with for this placement',
        
        -- Audit: who added it
        \`created_by\` int NOT NULL COMMENT 'Foreign key to Users table - who created this slot',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`is_deleted\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        
        PRIMARY KEY (\`placementslot_id\`),
        INDEX \`IDX_placement_slots_facility_id\` (\`facility_id\`),
        INDEX \`IDX_placement_slots_created_by\` (\`created_by\`),
        INDEX \`IDX_placement_slots_is_deleted\` (\`is_deleted\`),
        
        CONSTRAINT \`fk_placement_slot_user\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ placement_slots table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping placement_slots table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `placement_slots`');
    
    console.log('✅ placement_slots table dropped successfully');
  }
}
