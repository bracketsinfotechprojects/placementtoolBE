import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFileEntityTypeEnum1739300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update the ENUM to include PLACEMENT_EXECUTIVE
    // First, check current ENUM values and modify
    await queryRunner.query(`
      ALTER TABLE files
      MODIFY entity_type ENUM(
        'student',
        'facility',
        'placement',
        'placement_executive',
        'visa',
        'job',
        'agreement',
        'trainer'
      ) NOT NULL COMMENT 'Type of entity (student, facility, placement, etc.)'
    `);

    console.log('✅ Updated entity_type ENUM to include placement_executive');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the ENUM change
    await queryRunner.query(`
      ALTER TABLE files
      MODIFY entity_type ENUM(
        'student',
        'facility',
        'placement',
        'visa',
        'job',
        'agreement',
        'trainer'
      ) NOT NULL COMMENT 'Type of entity (student, facility, placement, etc.)'
    `);

    console.log('✅ Reverted entity_type ENUM');
  }
}
