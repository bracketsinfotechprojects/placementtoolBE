import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeEmploymentTypeToArray1739200000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change employment_type from enum to json in placement_executives table
    await queryRunner.changeColumn(
      'placement_executives',
      'employment_type',
      new TableColumn({
        name: 'employment_type',
        type: 'json',
        isNullable: true,
        comment: 'Array of employment types (full-time, part-time, contract)'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to enum
    await queryRunner.changeColumn(
      'placement_executives',
      'employment_type',
      new TableColumn({
        name: 'employment_type',
        type: 'enum',
        enum: ['full-time', 'part-time', 'contract'],
        isNullable: false,
        comment: 'Type of employment'
      })
    );
  }
}
