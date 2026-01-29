import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewFieldsToStudentTables1737820000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add fields to contact_details table
    await queryRunner.addColumn(
      'contact_details',
      new TableColumn({
        name: 'alternate_contact',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'Alternate contact number'
      })
    );

    await queryRunner.addColumn(
      'contact_details',
      new TableColumn({
        name: 'emergency_contact_name',
        type: 'varchar',
        length: '100',
        isNullable: true,
        comment: 'Emergency contact person name'
      })
    );

    await queryRunner.addColumn(
      'contact_details',
      new TableColumn({
        name: 'relationship',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Relationship with emergency contact'
      })
    );

    // Add field to visa_details table
    await queryRunner.addColumn(
      'visa_details',
      new TableColumn({
        name: 'work_limitation',
        type: 'text',
        isNullable: true,
        comment: 'Work limitations or restrictions on visa'
      })
    );

    // Add fields to addresses table
    await queryRunner.addColumn(
      'addresses',
      new TableColumn({
        name: 'line2',
        type: 'varchar',
        length: '255',
        isNullable: true,
        comment: 'Address line 2'
      })
    );

    await queryRunner.addColumn(
      'addresses',
      new TableColumn({
        name: 'suburb',
        type: 'varchar',
        length: '100',
        isNullable: true,
        comment: 'Suburb'
      })
    );

    // Add field to eligibility_status table
    await queryRunner.addColumn(
      'eligibility_status',
      new TableColumn({
        name: 'manual_override',
        type: 'boolean',
        default: false,
        isNullable: false,
        comment: 'Whether manual override is applied'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove fields from contact_details table
    await queryRunner.dropColumn('contact_details', 'alternate_contact');
    await queryRunner.dropColumn('contact_details', 'emergency_contact_name');
    await queryRunner.dropColumn('contact_details', 'relationship');

    // Remove field from visa_details table
    await queryRunner.dropColumn('visa_details', 'work_limitation');

    // Remove fields from addresses table
    await queryRunner.dropColumn('addresses', 'line2');
    await queryRunner.dropColumn('addresses', 'suburb');

    // Remove field from eligibility_status table
    await queryRunner.dropColumn('eligibility_status', 'manual_override');
  }
}
