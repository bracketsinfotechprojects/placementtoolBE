import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainerToCourseSlots1739800000000 implements MigrationInterface {
  name = 'AddTrainerToCourseSlots1739800000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Adding trainer_id to CourseSlots table...');

    // Add trainer_id column
    await queryRunner.query(`
      ALTER TABLE \`CourseSlots\` 
      ADD COLUMN \`trainer_id\` int NULL COMMENT 'Reference to Trainer table (assigned trainer for this course)' AFTER \`mobile_phone_policy\`
    `);

    // Add index for trainer_id
    await queryRunner.query(`
      CREATE INDEX \`IDX_CourseSlots_trainer_id\` ON \`CourseSlots\` (\`trainer_id\`)
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE \`CourseSlots\` 
      ADD CONSTRAINT \`FK_CourseSlots_trainer\` 
      FOREIGN KEY (\`trainer_id\`) REFERENCES \`Trainer\` (\`trainer_id\`) ON DELETE SET NULL
    `);

    console.log('✅ trainer_id added to CourseSlots table successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Removing trainer_id from CourseSlots table...');

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE \`CourseSlots\` DROP FOREIGN KEY \`FK_CourseSlots_trainer\`
    `);

    // Drop index
    await queryRunner.query(`
      DROP INDEX \`IDX_CourseSlots_trainer_id\` ON \`CourseSlots\`
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE \`CourseSlots\` DROP COLUMN \`trainer_id\`
    `);

    console.log('✅ trainer_id removed from CourseSlots table successfully!');
  }
}