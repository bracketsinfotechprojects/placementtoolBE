import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseSlotsTable1739500000000 implements MigrationInterface {
  name = 'CreateCourseSlotsTable1739500000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating CourseSlots table...');

    // Create CourseSlots table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`CourseSlots\` (
        \`course_id\` int NOT NULL AUTO_INCREMENT,
        
        -- Course Overview
        \`course_name\` varchar(255) NOT NULL COMMENT 'Name of the course',
        \`course_category\` set('Manual Handling', 'First Aid') NOT NULL COMMENT 'Categories: Manual Handling, First Aid',
        \`course_type\` set('Accredited', 'Non-Accredited', 'Refresher') NULL COMMENT 'Course types: Accredited, Non-Accredited, Refresher',
        \`course_scope\` set('Aged Care', 'Disability', 'Healthcare Students') NULL COMMENT 'Scopes: Aged Care, Disability, Healthcare Students',
        
        -- Schedule & Location
        \`course_date\` date NOT NULL COMMENT 'Date when the course is scheduled',
        \`day_of_week\` varchar(20) NULL COMMENT 'Day of the week for the course',
        \`reporting_time\` time NULL COMMENT 'Time when participants should report',
        \`expected_end_time\` time NULL COMMENT 'Expected end time of the course',
        \`total_duration\` varchar(50) NULL COMMENT 'Total duration e.g. "4 hours", "Full Day"',
        \`mode\` set('Onsite', 'Online', 'Hybrid') NULL COMMENT 'Modes: Onsite, Online, Hybrid',
        \`training_location\` varchar(255) NULL COMMENT 'Name of the training location/venue',
        \`address\` varchar(255) NULL COMMENT 'Full address of the training location',
        \`city\` varchar(100) NULL COMMENT 'City where training is conducted',
        \`google_maps_link\` varchar(500) NULL COMMENT 'Google Maps link to the training location',
        
        -- Seat Availability
        \`total_seats\` int NULL COMMENT 'Total number of seats available',
        \`seats_remaining\` int NULL COMMENT 'Number of seats remaining',
        \`seat_status\` enum('Available', 'Filling Fast', 'Full') NULL COMMENT 'Status: Available, Filling Fast, Full',
        \`last_booking_date\` date NULL COMMENT 'Last date for booking',
        
        -- Certification Details
        \`certificate_issued\` tinyint(1) NULL DEFAULT 0 COMMENT 'Whether certificate is issued',
        \`certificate_type\` set('Digital', 'Physical') NULL COMMENT 'Certificate types: Digital, Physical',
        \`certificate_validity\` varchar(50) NULL COMMENT 'Validity period e.g. "12 months"',
        \`issuing_authority\` set('Institute', 'Registered Body') NULL COMMENT 'Issuing authorities: Institute, Registered Body',
        \`certificate_issue_timeline\` enum('Same Day', 'Within 48 Hours') NULL COMMENT 'Timeline: Same Day, Within 48 Hours',
        
        -- Eligibility & Requirements
        \`target_audience\` set('External', 'Internal') NULL COMMENT 'Target audiences: External, Internal',
        \`documents_required\` set('ID Proof', 'Payment Receipt') NULL COMMENT 'Required documents: ID Proof, Payment Receipt',
        \`pre_course_requirement\` set('Online Module', 'None') NULL COMMENT 'Pre-course requirements: Online Module, None',
        
        -- Dress Code & Items
        \`dress_code\` varchar(255) NULL COMMENT 'Dress code e.g. "Comfortable clothing"',
        \`items_to_bring\` set('Notebook & Pen', 'Water Bottle') NULL COMMENT 'Items to bring: Notebook & Pen, Water Bottle',
        \`mobile_phone_policy\` enum('Silent', 'Restricted') NULL COMMENT 'Policy: Silent, Restricted',
        
        -- Audit fields
        \`created_by\` varchar(100) NULL COMMENT 'Name or ID of the person who added the course',
        \`isDeleted\` tinyint NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
        
        PRIMARY KEY (\`course_id\`),
        INDEX \`IDX_CourseSlots_course_date\` (\`course_date\`),
        INDEX \`IDX_CourseSlots_course_category\` (\`course_category\`),
        INDEX \`IDX_CourseSlots_seat_status\` (\`seat_status\`),
        INDEX \`IDX_CourseSlots_isdeleted\` (\`isDeleted\`)
      ) ENGINE=InnoDB
    `);

    console.log('✅ CourseSlots table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping CourseSlots table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `CourseSlots`');
    
    console.log('✅ CourseSlots table dropped successfully');
  }
}
