import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFacilitySupervisorsTable1737820000007 implements MigrationInterface {
  name = 'CreateFacilitySupervisorsTable1737820000007'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating FacilitySupervisor table...');

    // Create FacilitySupervisor table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`FacilitySupervisor\` (
        \`supervisor_id\` int NOT NULL AUTO_INCREMENT,
        \`full_name\` varchar(150) NOT NULL COMMENT 'Full name of the facility supervisor',
        \`designation\` varchar(100) NOT NULL COMMENT 'Designation/title of the supervisor',
        \`mobile_number\` varchar(20) NOT NULL COMMENT 'Mobile number of the supervisor',
        \`email\` varchar(150) NULL COMMENT 'Email ID of the supervisor',
        \`photograph\` varchar(255) NULL COMMENT 'Path to photograph file',
        \`facility_id\` int NOT NULL COMMENT 'Foreign key to facility table',
        \`facility_name\` varchar(255) NULL COMMENT 'Name of the facility (denormalized for quick access)',
        \`branch_site\` varchar(100) NULL COMMENT 'Branch or site name within the facility',
        \`facility_types\` json NULL COMMENT 'Array of facility types (Aged Care, Disability, Home Care)',
        \`facility_address\` text NULL COMMENT 'Address of the facility',
        \`max_students_can_handle\` int NULL COMMENT 'Maximum number of students the supervisor can handle',
        \`id_proof_document\` varchar(255) NULL COMMENT 'Path to ID proof document',
        \`police_check_document\` varchar(255) NULL COMMENT 'Path to police check document',
        \`authorization_letter_document\` varchar(255) NULL COMMENT 'Path to authorization letter from facility',
        \`portal_access_enabled\` tinyint NOT NULL DEFAULT 0 COMMENT 'Whether supervisor has portal access',
        \`user_id\` int NULL COMMENT 'Foreign key to users table for login credentials',
        \`isDeleted\` tinyint NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
        PRIMARY KEY (\`supervisor_id\`),
        UNIQUE INDEX \`IDX_FacilitySupervisor_email\` (\`email\`),
        INDEX \`IDX_FacilitySupervisor_facility_id\` (\`facility_id\`),
        INDEX \`IDX_FacilitySupervisor_mobile\` (\`mobile_number\`),
        INDEX \`IDX_FacilitySupervisor_user_id\` (\`user_id\`),
        INDEX \`IDX_FacilitySupervisor_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_FacilitySupervisor_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE RESTRICT,
        CONSTRAINT \`FK_FacilitySupervisor_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    console.log('✅ FacilitySupervisor table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping FacilitySupervisor table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `FacilitySupervisor`');
    
    console.log('✅ FacilitySupervisor table dropped successfully');
  }
}
