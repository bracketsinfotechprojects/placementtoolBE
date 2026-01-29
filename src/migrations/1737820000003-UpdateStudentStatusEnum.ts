import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStudentStatusEnum1737820000003 implements MigrationInterface {
  name = 'UpdateStudentStatusEnum1737820000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update the enum type for student status
    await queryRunner.query(`
      ALTER TABLE \`students\` 
      MODIFY COLUMN \`status\` ENUM(
        'active',
        'inactive',
        'internship_completed',
        'eligible_for_certification',
        'placement_initiated',
        'self_placement_verification_pending',
        'self_placement_approved',
        'certified',
        'completed',
        'graduated',
        'withdrawn'
      ) NOT NULL DEFAULT 'active' 
      COMMENT 'Student status'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to old enum values
    await queryRunner.query(`
      ALTER TABLE \`students\` 
      MODIFY COLUMN \`status\` ENUM(
        'active',
        'inactive',
        'graduated',
        'withdrawn'
      ) NOT NULL DEFAULT 'active' 
      COMMENT 'Student status'
    `);
  }
}
