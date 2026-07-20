import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlacementApprovedToStudentStatusEnum1781300000000 implements MigrationInterface {
  name = 'AddPlacementApprovedToStudentStatusEnum1781300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`students\`
      MODIFY COLUMN \`status\` ENUM(
        'active',
        'inactive',
        'internship_completed',
        'eligible_for_certification',
        'placement_initiated',
        'placement_approved',
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
}
