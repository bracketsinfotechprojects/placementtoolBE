import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificateTable1747200000000 implements MigrationInterface {
  name = 'CreateCertificateTable1747200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating Certificates table...');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`certificates\` (
        \`certificate_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL COMMENT 'Foreign key to students table',
        \`assignment_type\` enum('course', 'placement') NOT NULL COMMENT 'Type of assignment: course or placement',
        \`assignment_id\` int NOT NULL COMMENT 'Foreign key to CourseAssignments or PlacementAssignments table',
        \`certificate_file_path\` varchar(255) NOT NULL COMMENT 'Path/URL to certificate file',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`created_by_user_id\` int NOT NULL COMMENT 'User who uploaded the certificate',
        \`is_deleted\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        
        PRIMARY KEY (\`certificate_id\`),
        
        INDEX \`IDX_student_id\` (\`student_id\`),
        INDEX \`IDX_assignment_id\` (\`assignment_id\`),
        INDEX \`IDX_assignment_type\` (\`assignment_type\`),
        INDEX \`IDX_student_assignment\` (\`student_id\`, \`assignment_id\`),
        
        CONSTRAINT \`fk_certificate_student\` FOREIGN KEY (\`student_id\`) 
          REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_certificate_created_by\` FOREIGN KEY (\`created_by_user_id\`) 
          REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Certificates table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping Certificates table...');
    await queryRunner.query('DROP TABLE IF EXISTS \`certificates\`');
    console.log('✅ Certificates table dropped successfully');
  }
}
