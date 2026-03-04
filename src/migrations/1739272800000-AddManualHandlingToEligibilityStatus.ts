import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManualHandlingToEligibilityStatus1739272800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('eligibility_status');
    const manualHandlingColumn = table?.findColumnByName('manual_handling');

    if (!manualHandlingColumn) {
      // Add manual_handling column to eligibility_status table
      await queryRunner.query(`
        ALTER TABLE eligibility_status
        ADD COLUMN manual_handling BOOLEAN DEFAULT FALSE NOT NULL
        COMMENT 'Whether manual handling is required'
        AFTER manual_override
      `);

      console.log('✅ Added manual_handling column to eligibility_status table');
    } else {
      console.log('⚠️ manual_handling column already exists in eligibility_status table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove manual_handling column
    await queryRunner.query(`
      ALTER TABLE eligibility_status
      DROP COLUMN manual_handling
    `);

    console.log('✅ Removed manual_handling column from eligibility_status table');
  }
}
