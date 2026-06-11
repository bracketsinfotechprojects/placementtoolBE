import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePlacementAssignmentStatusEnum20260611064358 implements MigrationInterface {
  name = 'UpdatePlacementAssignmentStatusEnum20260611064358'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Updating placement_assignments status enum with all values...');

    // Update status enum to include all values needed: Assigned, Active, Completed, Cancelled, Dropped, Allocated, Started
    console.log('📝 Updating status column enum...');
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`status\` enum ('Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped', 'Allocated', 'Started') NOT NULL DEFAULT 'Assigned' 
      COMMENT 'Status of the assignment'
    `);

    console.log('✅ Status enum updated successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️ Reverting placement_assignments status enum...');
    
    await queryRunner.query(`
      ALTER TABLE \`placement_assignments\` 
      MODIFY COLUMN \`status\` enum ('Allocated', 'Started', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Allocated' 
      COMMENT 'Status of the assignment'
    `);
    
    console.log('✅ Status enum reverted successfully');
  }
}
