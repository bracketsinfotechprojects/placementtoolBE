import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainersTable1738600000000 implements MigrationInterface {
  name = 'CreateTrainersTable1738600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating Trainer table...');

    // Create Trainer table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`Trainer\` (
        \`trainer_id\` int NOT NULL AUTO_INCREMENT,
        \`first_name\` varchar(100) NOT NULL COMMENT 'First name of the trainer',
        \`last_name\` varchar(100) NOT NULL COMMENT 'Last name of the trainer',
        \`gender\` varchar(20) NOT NULL COMMENT 'Gender of the trainer',
        \`date_of_birth\` date NOT NULL COMMENT 'Date of birth of the trainer',
        \`mobile_number\` varchar(20) NOT NULL COMMENT 'Mobile number of the trainer',
        \`alternate_contact\` varchar(20) NULL COMMENT 'Alternate contact number of the trainer',
        \`email\` varchar(150) NOT NULL COMMENT 'Email ID of the trainer',
        \`trainer_type\` varchar(100) NULL COMMENT 'Type of trainer (e.g., Full-time, Part-time, Contract)',
        \`course_auth\` varchar(255) NULL COMMENT 'Course authorization/qualifications',
        \`acc_numbers\` varchar(255) NULL COMMENT 'Account numbers or identifiers',
        \`yoe\` int NULL COMMENT 'Years of experience',
        \`state_covered\` json NULL COMMENT 'Array of states covered by the trainer',
        \`cities_covered\` json NULL COMMENT 'Array of cities covered by the trainer',
        \`available_days\` json NULL COMMENT 'Array of available days (e.g., Monday, Tuesday)',
        \`time_slots\` json NULL COMMENT 'Array of available time slots',
        \`suprise_visit\` tinyint NOT NULL DEFAULT 0 COMMENT 'Whether trainer can do surprise visits',
        \`photograph\` varchar(255) NULL COMMENT 'Path to photograph file',
        \`user_id\` int NULL COMMENT 'Foreign key to users table for login credentials',
        \`isDeleted\` tinyint NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
        PRIMARY KEY (\`trainer_id\`),
        UNIQUE INDEX \`IDX_Trainer_email\` (\`email\`),
        INDEX \`IDX_Trainer_mobile\` (\`mobile_number\`),
        INDEX \`IDX_Trainer_user_id\` (\`user_id\`),
        INDEX \`IDX_Trainer_isdeleted\` (\`isDeleted\`)
      ) ENGINE=InnoDB
    `);

    console.log('✅ Trainer table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping Trainer table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `Trainer`');
    
    console.log('✅ Trainer table dropped successfully');
  }
}
