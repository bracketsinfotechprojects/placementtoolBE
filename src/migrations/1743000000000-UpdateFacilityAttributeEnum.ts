import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFacilityAttributeEnum1743000000000 implements MigrationInterface {
  name = 'UpdateFacilityAttributeEnum1743000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Updating facility_attributes enum to include all attribute types...');

    // Update the attribute_type enum to include all values from the entity
    await queryRunner.query(`
      ALTER TABLE \`facility_attributes\` 
      MODIFY COLUMN \`attribute_type\` enum('Category','State','care_type','capacity','facility_type','accreditation','specialty') NOT NULL
    `);

    console.log('✅ facility_attributes enum updated successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting facility_attributes enum to original values...');

    // Revert back to original enum values
    await queryRunner.query(`
      ALTER TABLE \`facility_attributes\` 
      MODIFY COLUMN \`attribute_type\` enum('Category','State') NOT NULL
    `);

    console.log('✅ facility_attributes enum reverted successfully!');
  }
}
