import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentPathsToTrainer1739900000000 implements MigrationInterface {
  name = 'AddDocumentPathsToTrainer1739900000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Adding document path columns to Trainer table...');

    // Add wwc_document column
    await queryRunner.query(`
      ALTER TABLE \`Trainer\` 
      ADD COLUMN \`wwc_document\` varchar(255) NULL 
      COMMENT 'Path to Working With Children Check document file'
      AFTER \`wwc_expiry_date\`
    `);

    // Add police_check_document column
    await queryRunner.query(`
      ALTER TABLE \`Trainer\` 
      ADD COLUMN \`police_check_document\` varchar(255) NULL 
      COMMENT 'Path to Police Check document file'
      AFTER \`police_check_expiry_date\`
    `);

    console.log('✅ Document path columns added successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Removing document path columns from Trainer table...');

    await queryRunner.query(`
      ALTER TABLE \`Trainer\` 
      DROP COLUMN \`police_check_document\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`Trainer\` 
      DROP COLUMN \`wwc_document\`
    `);

    console.log('✅ Document path columns removed successfully');
  }
}
