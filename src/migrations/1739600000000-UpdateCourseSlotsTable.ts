import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCourseSlotsTable1739600000000 implements MigrationInterface {
  name = 'UpdateCourseSlotsTable1739600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Updating CourseSlots table...');

    // Modify course_category from ENUM to SET to allow multiple values
    await queryRunner.query(`
      ALTER TABLE \`CourseSlots\` 
      MODIFY COLUMN \`course_category\` set('Manual Handling', 'First Aid') NOT NULL COMMENT 'Categories: Manual Handling, First Aid'
    `);

    // Drop the duplicate created_at column if it exists
    try {
      await queryRunner.query(`
        ALTER TABLE \`CourseSlots\` DROP COLUMN \`created_at\`
      `);
    } catch (error) {
      console.log('Column created_at may not exist, skipping...');
    }

    console.log('✅ CourseSlots table updated successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Reverting CourseSlots table changes...');
    
    // Revert course_category back to ENUM
    await queryRunner.query(`
      ALTER TABLE \`CourseSlots\` 
      MODIFY COLUMN \`course_category\` enum('Manual Handling', 'First Aid') NOT NULL COMMENT 'Category: Manual Handling, First Aid'
    `);
    
    console.log('✅ CourseSlots table reverted successfully');
  }
}