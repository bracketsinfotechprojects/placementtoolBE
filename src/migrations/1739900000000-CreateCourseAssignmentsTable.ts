import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseAssignmentsTable1739900000000 implements MigrationInterface {
  name = 'CreateCourseAssignmentsTable1739900000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Creating CourseAssignments table...');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`CourseAssignments\` (
        \`assignment_id\` int NOT NULL AUTO_INCREMENT,
        
        -- Foreign Keys
        \`course_id\` int NOT NULL COMMENT 'Reference to CourseSlots table',
        \`trainer_id\` int NOT NULL COMMENT 'Reference to Trainer table',
        \`student_id\` int NOT NULL COMMENT 'Reference to students table',
        
        -- Metadata
        \`enrollment_date\` date NULL DEFAULT (CURRENT_DATE) COMMENT 'Date when student was enrolled in the course',
        \`status\` enum('Active', 'Completed', 'Dropped') NOT NULL DEFAULT 'Active' COMMENT 'Status of the assignment',
        
        -- Audit fields
        \`isDeleted\` tinyint NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
        
        PRIMARY KEY (\`assignment_id\`),
        INDEX \`IDX_CourseAssignments_course_id\` (\`course_id\`),
        INDEX \`IDX_CourseAssignments_trainer_id\` (\`trainer_id\`),
        INDEX \`IDX_CourseAssignments_student_id\` (\`student_id\`),
        INDEX \`IDX_CourseAssignments_status\` (\`status\`),
        INDEX \`IDX_CourseAssignments_isdeleted\` (\`isDeleted\`),
        
        -- Prevent duplicate mappings
        UNIQUE INDEX \`UQ_CourseAssignments_unique\` (\`course_id\`, \`trainer_id\`, \`student_id\`),
        
        -- Foreign key constraints
        CONSTRAINT \`FK_CourseAssignments_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`CourseSlots\` (\`course_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_CourseAssignments_trainer\` FOREIGN KEY (\`trainer_id\`) REFERENCES \`Trainer\` (\`trainer_id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_CourseAssignments_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    console.log('CourseAssignments table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Dropping CourseAssignments table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `CourseAssignments`');
    
    console.log('CourseAssignments table dropped successfully');
  }
}