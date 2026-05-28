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

    // Step 2: Update status values
    console.log('📝 Updating status values...');
    await queryRunner.query(`
      UPDATE \`placement_assignments\` 
      SET \`status\` = 'Allocated' 
      WHERE \`status\` IN ('Assigned', 'Active', 'Dropped')
    `);

    // Step 3: Convert status back to ENUM with new values
    console.log('📝 Converting status column back to ENUM...');
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`status\` enum ('Allocated', 'Started', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Allocated' 
      COMMENT 'Status of the assignment'
    `);

    // Step 4: Add facility_confirmation_status column if it doesn't exist
    console.log('📝 Adding facility_confirmation_status column...');
    const hasColumn = await queryRunner.hasColumn('placement_assignments', 'facility_confirmation_status');
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE \`placement_assignments\` 
        ADD COLUMN \`facility_confirmation_status\` enum ('Approved', 'Rejected') NULL DEFAULT NULL 
        COMMENT 'Facility confirmation status: Approved, Rejected'
      `);
    } else {
      // If column exists, just update the enum values
      await queryRunner.query(`
        ALTER TABLE \`placement_assignments\` 
        MODIFY COLUMN \`facility_confirmation_status\` enum ('Approved', 'Rejected') NULL DEFAULT NULL 
        COMMENT 'Facility confirmation status: Approved, Rejected'
      `);
    }

    // Step 5: Add index for facility_confirmation_status
    try {
      await queryRunner.query(`
        ALTER TABLE \`placement_assignments\` 
        ADD INDEX \`IDX_placement_assignments_facility_confirmation_status\` (\`facility_confirmation_status\`)
      `);
    } catch (error) {
      // Index might already exist, ignore error
      console.log('📝 Index already exists or could not be created');
    }

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

    // Drop facility_confirmation_status column if it was added by this migration
    const hasColumn = await queryRunner.hasColumn('placement_assignments', 'facility_confirmation_status');
    if (hasColumn) {
      await queryRunner.query(`
        ALTER TABLE \`placement_assignments\` 
        DROP COLUMN \`facility_confirmation_status\`
      `);
    }
    
    console.log('✅ Enum values reverted successfully');
  }
}
