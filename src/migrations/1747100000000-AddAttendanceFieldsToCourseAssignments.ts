import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceFieldsToCourseAssignments1747100000000 implements MigrationInterface {
  name = 'AddAttendanceFieldsToCourseAssignments1747100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Adding attendance fields to CourseAssignments table...');

    // Add attendance_status column
    await queryRunner.query(`
      ALTER TABLE \`CourseAssignments\` 
      ADD COLUMN \`attendance_status\` enum('present', 'absent', 'late', 'early_departure', 'half_day', 'leave') 
      NOT NULL DEFAULT 'absent' COMMENT 'Attendance status'
      AFTER \`status\`
    `);

    // Add attendance_date column
    await queryRunner.query(`
      ALTER TABLE \`CourseAssignments\` 
      ADD COLUMN \`attendance_date\` date 
      NULL COMMENT 'Date of attendance mark'
      AFTER \`attendance_status\`
    `);

    // Add trainer_notes column
    await queryRunner.query(`
      ALTER TABLE \`CourseAssignments\` 
      ADD COLUMN \`trainer_notes\` varchar(500) 
      NULL COMMENT 'Notes from trainer regarding attendance'
      AFTER \`attendance_date\`
    `);

    // Add attendance_updated_at column
    await queryRunner.query(`
      ALTER TABLE \`CourseAssignments\` 
      ADD COLUMN \`attendance_updated_at\` timestamp 
      NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'When attendance was last updated'
      AFTER \`trainer_notes\`
    `);

    console.log('✅ Attendance fields added to CourseAssignments table successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Removing attendance fields from CourseAssignments table...');
    
    await queryRunner.query(`ALTER TABLE \`CourseAssignments\` DROP COLUMN \`attendance_status\``);
    await queryRunner.query(`ALTER TABLE \`CourseAssignments\` DROP COLUMN \`attendance_date\``);
    await queryRunner.query(`ALTER TABLE \`CourseAssignments\` DROP COLUMN \`trainer_notes\``);
    await queryRunner.query(`ALTER TABLE \`CourseAssignments\` DROP COLUMN \`attendance_updated_at\``);
    
    console.log('✅ Attendance fields removed from CourseAssignments table successfully');
  }
}
