import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoleLinksToUsers1737820000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add facilityID column for Facility role users (roleID = 2)
        await queryRunner.addColumn('users', new TableColumn({
            name: 'facilityID',
            type: 'int',
            isNullable: true,
            comment: 'Foreign key to facilities table (for facility users with roleID = 2)'
        }));

        // Add supervisorID column for Supervisor role users (roleID = 3)
        await queryRunner.addColumn('users', new TableColumn({
            name: 'supervisorID',
            type: 'int',
            isNullable: true,
            comment: 'Foreign key to supervisors table (for supervisor users with roleID = 3)'
        }));

        // Add placementExecutiveID column for Placement Executive role users (roleID = 4)
        await queryRunner.addColumn('users', new TableColumn({
            name: 'placementExecutiveID',
            type: 'int',
            isNullable: true,
            comment: 'Foreign key to placement_executives table (for placement executive users with roleID = 4)'
        }));

        // Add trainerID column for Trainer role users (roleID = 5)
        await queryRunner.addColumn('users', new TableColumn({
            name: 'trainerID',
            type: 'int',
            isNullable: true,
            comment: 'Foreign key to trainers table (for trainer users with roleID = 5)'
        }));

        console.log('✅ Added role-specific foreign key columns to users table');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the columns in reverse order
        await queryRunner.dropColumn('users', 'trainerID');
        await queryRunner.dropColumn('users', 'placementExecutiveID');
        await queryRunner.dropColumn('users', 'supervisorID');
        await queryRunner.dropColumn('users', 'facilityID');

        console.log('✅ Removed role-specific foreign key columns from users table');
    }
}
