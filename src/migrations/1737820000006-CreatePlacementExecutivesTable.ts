import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlacementExecutivesTable1737820000006 implements MigrationInterface {
  name = 'CreatePlacementExecutivesTable1737820000006'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating placement_executives table...');

    // Create placement_executives table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`placement_executives\` (
        \`executive_id\` int NOT NULL AUTO_INCREMENT,
        \`full_name\` varchar(150) NOT NULL COMMENT 'Full name of the placement executive',
        \`mobile_number\` varchar(20) NOT NULL COMMENT 'Mobile number of the placement executive',
        \`email\` varchar(150) NULL COMMENT 'Email ID of the placement executive',
        \`photograph\` varchar(255) NULL COMMENT 'Path to photograph file',
        \`joining_date\` date NOT NULL COMMENT 'Date when the executive joined',
        \`employment_type\` enum('full-time','part-time','contract') NOT NULL COMMENT 'Type of employment',
        \`facility_types_handled\` json NULL COMMENT 'Array of facility types handled (Aged Care, Disability, Home Care)',
        \`user_id\` int NULL COMMENT 'Foreign key to users table for login credentials',
        \`isDeleted\` tinyint NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
        PRIMARY KEY (\`executive_id\`),
        UNIQUE INDEX \`IDX_placement_executives_email\` (\`email\`),
        INDEX \`IDX_placement_executives_mobile\` (\`mobile_number\`),
        INDEX \`IDX_placement_executives_user_id\` (\`user_id\`),
        INDEX \`IDX_placement_executives_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_placement_executives_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    console.log('✅ placement_executives table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping placement_executives table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `placement_executives`');
    
    console.log('✅ placement_executives table dropped successfully');
  }
}
