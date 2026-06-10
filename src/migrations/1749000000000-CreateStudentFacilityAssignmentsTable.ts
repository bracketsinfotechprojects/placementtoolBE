import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentFacilityAssignmentsTable1749000000000 implements MigrationInterface {
  name = 'CreateStudentFacilityAssignmentsTable1749000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating student_facility_assignments table...');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`student_facility_assignments\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL COMMENT 'Foreign key to students table',
        \`facility_id\` int NOT NULL COMMENT 'Foreign key to facility table',
        \`assigned_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when facility was assigned to student',

        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_student_facility\` (\`student_id\`, \`facility_id\`),
        INDEX \`IDX_sfa_student_id\` (\`student_id\`),
        INDEX \`IDX_sfa_facility_id\` (\`facility_id\`),

        CONSTRAINT \`fk_sfa_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_sfa_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ student_facility_assignments table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️ Dropping student_facility_assignments table...');
    await queryRunner.query('DROP TABLE IF EXISTS `student_facility_assignments`');
    console.log('✅ student_facility_assignments table dropped successfully');
  }
}
