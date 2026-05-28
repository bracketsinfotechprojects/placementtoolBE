import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePlacementAssignmentEnumValues20260515111348 implements MigrationInterface {
    name = 'UpdatePlacementAssignmentEnumValues20260515111348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🚀 Updating placement_assignments enum values...');

        // Step 1: Convert status to VARCHAR temporarily
        console.log('📝 Converting status column to VARCHAR...');
        await queryRunner.query(`
            ALTER TABLE \`placement_assignments\` 
            MODIFY COLUMN \`status\` VARCHAR(50) NOT NULL DEFAULT 'Assigned'
        `);

        // Step 2: Update status values - map old values to new ones
        console.log('📝 Updating status values...');
        await queryRunner.query(`
            UPDATE \`placement_assignments\` 
            SET \`status\` = CASE 
                WHEN \`status\` = 'Allocated' THEN 'Assigned'
                WHEN \`status\` = 'Started' THEN 'Active'
                ELSE \`status\`
            END
        `);

        // Step 3: Convert status back to ENUM with new values
        console.log('📝 Converting status column back to ENUM...');
        await queryRunner.query(`
            ALTER TABLE \`placement_assignments\` 
            MODIFY COLUMN \`status\` enum ('Assigned', 'Active', 'Completed', 'Cancelled', 'Dropped') NOT NULL DEFAULT 'Assigned' 
            COMMENT 'Status of the assignment'
        `);

        console.log('✅ Enum values updated successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🗑️ Reverting placement_assignments enum values...');

        // Step 1: Convert status to VARCHAR temporarily
        console.log('📝 Converting status column to VARCHAR...');
        await queryRunner.query(`
            ALTER TABLE \`placement_assignments\` 
            MODIFY COLUMN \`status\` VARCHAR(50) NOT NULL DEFAULT 'Assigned'
        `);

        // Step 2: Revert status values - map new values back to old ones
        console.log('📝 Reverting status values...');
        await queryRunner.query(`
            UPDATE \`placement_assignments\` 
            SET \`status\` = CASE 
                WHEN \`status\` = 'Assigned' THEN 'Allocated'
                WHEN \`status\` = 'Active' THEN 'Started'
                ELSE \`status\`
            END
        `);

        // Step 3: Convert status back to ENUM with old values
        console.log('📝 Converting status column back to ENUM...');
        await queryRunner.query(`
            ALTER TABLE \`placement_assignments\` 
            MODIFY COLUMN \`status\` enum ('Allocated', 'Started', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Allocated' 
            COMMENT 'Status of the assignment'
        `);

        console.log('✅ Enum values reverted successfully');
    }
}