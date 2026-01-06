import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentIDToUsers1704205900000 implements MigrationInterface {
  name = 'AddStudentIDToUsers1704205900000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Adding studentID column to users table...');

    // Check if column already exists
    const table = await queryRunner.getTable('users');
    const studentIDColumn = table?.findColumnByName('studentID');

    if (!studentIDColumn) {
      // Add studentID column
      await queryRunner.query(`
        ALTER TABLE \`users\` 
        ADD COLUMN \`studentID\` int NULL 
        COMMENT 'Foreign key to students table (for student users)' 
        AFTER \`roleID\`
      `);

      // Add index for studentID
      await queryRunner.query(`
        CREATE INDEX \`IDX_users_studentID\` ON \`users\` (\`studentID\`)
      `);

      console.log('✅ studentID column added successfully');
      console.log('✅ Index created on studentID');
    } else {
      console.log('ℹ️  studentID column already exists, skipping...');
    }

    console.log('🎉 Migration completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Removing studentID column from users table...');

    // Drop index first
    await queryRunner.query(`
      DROP INDEX \`IDX_users_studentID\` ON \`users\`
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE \`users\` DROP COLUMN \`studentID\`
    `);

    console.log('✅ studentID column removed successfully');
  }
}
