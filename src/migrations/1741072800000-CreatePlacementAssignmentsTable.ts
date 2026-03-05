import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlacementAssignmentsTable1741072800000 implements MigrationInterface {
  name = 'CreatePlacementAssignmentsTable1741072800000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating placement_assignments table...');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`placement_assignments\` (
        \`assignment_id\` int NOT NULL AUTO_INCREMENT,
        \`placementslot_id\` int NOT NULL COMMENT 'Reference to placement_slots table',
        \`student_id\` int NOT NULL COMMENT 'Reference to students table',
        \`status\` enum ('Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped') NOT NULL DEFAULT 'Assigned' COMMENT 'Status of the assignment',
        \`start_date\` date NULL COMMENT 'Actual start date for this student',
        \`end_date\` date NULL COMMENT 'Actual end date for this student',
        \`notes\` text NULL COMMENT 'Notes about this assignment',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
        
        PRIMARY KEY (\`assignment_id\`),
        INDEX \`IDX_placement_assignments_placementslot_id\` (\`placementslot_id\`),
        INDEX \`IDX_placement_assignments_student_id\` (\`student_id\`),
        INDEX \`IDX_placement_assignments_status\` (\`status\`),
        
        CONSTRAINT \`fk_placement_assignment_slot\` FOREIGN KEY (\`placementslot_id\`) REFERENCES \`placement_slots\`(\`placementslot_id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fk_placement_assignment_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ placement_assignments table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️ Dropping placement_assignments table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `placement_assignments`');
    
    console.log('✅ placement_assignments table dropped successfully');
  }
}
