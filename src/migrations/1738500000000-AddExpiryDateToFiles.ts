import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiryDateToFiles1738500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('files');
    const expiryDateColumn = table?.findColumnByName('expiry_date');

    if (!expiryDateColumn) {
      // Add expiry_date column to files table
      await queryRunner.query(`
        ALTER TABLE files 
        ADD COLUMN expiry_date DATE NULL 
        COMMENT 'Expiry date for documents like passport, visa, police check, etc.'
        AFTER is_active
      `);

      // Add index for faster queries on expiry_date
      await queryRunner.query(`
        CREATE INDEX idx_expiry_date ON files(expiry_date)
      `);

      console.log('✅ Added expiry_date column to files table');
    } else {
      console.log('⚠️ expiry_date column already exists in files table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index first
    await queryRunner.query(`
      DROP INDEX idx_expiry_date ON files
    `);

    // Remove expiry_date column
    await queryRunner.query(`
      ALTER TABLE files 
      DROP COLUMN expiry_date
    `);

    console.log('✅ Removed expiry_date column from files table');
  }
}
