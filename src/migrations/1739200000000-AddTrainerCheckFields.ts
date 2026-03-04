import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTrainerCheckFields1739200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to trainers table
    await queryRunner.addColumns('Trainer', [
      new TableColumn({
        name: 'wwchildcheck',
        type: 'int',
        isNullable: true,
        comment: 'Working With Children Check status (0=Pending, 1=Approved, 2=Expired)'
      }),
      new TableColumn({
        name: 'wwc_expiry_date',
        type: 'date',
        isNullable: true,
        comment: 'Working With Children Check expiry date'
      }),
      new TableColumn({
        name: 'police_check_number',
        type: 'varchar',
        length: '100',
        isNullable: true,
        comment: 'Police check reference number'
      }),
      new TableColumn({
        name: 'police_check_expiry_date',
        type: 'date',
        isNullable: true,
        comment: 'Police check expiry date'
      })
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns in reverse order
    await queryRunner.dropColumn('Trainer', 'police_check_expiry_date');
    await queryRunner.dropColumn('Trainer', 'police_check_number');
    await queryRunner.dropColumn('Trainer', 'wwc_expiry_date');
    await queryRunner.dropColumn('Trainer', 'wwchildcheck');
  }
}
