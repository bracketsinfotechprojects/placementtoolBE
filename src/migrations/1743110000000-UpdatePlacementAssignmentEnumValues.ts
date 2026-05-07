import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePlacementAssignmentEnumValues1743110000000 implements MigrationInterface {
  name = 'UpdatePlacementAssignmentEnumValues1743110000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Updating placement_assignments enum values...');

    // Step 1: Convert status to VARCHAR temporarily
    console.log('📝 Converting status column to VARCHAR...');
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`status\` VARCHAR(50) NOT NULL DEFAULT 'Allocated'
    `);

    // Step 2: Convert facility_confirmation_status to VARCHAR temporarily
    console.log('📝 Converting facility_confirmation_status column to VARCHAR...');
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`facility_confirmation_status\` VARCHAR(50) NULL DEFAULT NULL
    `);

    // Step 3: Update status values
    console.log('📝 Updating status values...');
    await queryRunner.query(`
      UPDATE \`placement_assignments\` 
      SET \`status\` = 'Allocated' 
      WHERE \`status\` IN ('Assigned', 'Active', 'Dropped')
    `);

    // Step 4: Update facility_confirmation_status values
    console.log('📝 Updating facility_confirmation_status values...');
    await queryRunner.query(`
      UPDATE \`placement_assignments\` 
      SET \`facility_confirmation_status\` = 'Approved' 
      WHERE \`facility_confirmation_status\` IN ('Allocated', 'Started', 'Completed', 'Cancelled')
    `);

    // Step 5: Convert status back to ENUM with new values
    console.log('📝 Converting status column back to ENUM...');
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`status\` enum ('Allocated', 'Started', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Allocated' 
      COMMENT 'Status of the assignment'
    `);

    // Step 6: Convert facility_confirmation_status back to ENUM with new values
    console.log('📝 Converting facility_confirmation_status column back to ENUM...');
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`facility_confirmation_status\` enum ('Approved', 'Rejected') NULL DEFAULT NULL 
      COMMENT 'Facility confirmation status: Approved, Rejected'
    `);

    console.log('✅ Enum values updated successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️ Reverting placement_assignments enum values...');
    
    // Revert status column enum values
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`status\` enum ('Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped') NOT NULL DEFAULT 'Assigned' 
      COMMENT 'Status of the assignment'
    `);

    // Revert facility_confirmation_status column enum values
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`facility_confirmation_status\` enum ('Allocated', 'Started', 'Completed', 'Cancelled') NULL DEFAULT NULL 
      COMMENT 'Facility confirmation status: Allocated, Started, Completed, Cancelled'
    `);
    
    console.log('✅ Enum values reverted successfully');
  }
}
