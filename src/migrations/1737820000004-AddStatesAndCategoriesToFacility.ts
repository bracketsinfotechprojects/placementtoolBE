import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatesAndCategoriesToFacility1737820000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Adding states_covered and categories columns to facility table...');

    // Add states_covered column
    await queryRunner.addColumn(
      'facility',
      new TableColumn({
        name: 'states_covered',
        type: 'json',
        isNullable: true,
        comment: 'Array of states where facility operates (e.g., ["NSW", "VIC", "QLD"])'
      })
    );

    // Add categories column
    await queryRunner.addColumn(
      'facility',
      new TableColumn({
        name: 'categories',
        type: 'json',
        isNullable: true,
        comment: 'Array of care categories offered (e.g., ["Aged Care", "Residential Care"])'
      })
    );

    console.log('✅ states_covered and categories columns added successfully!');
    console.log('📝 Note: You can now store states and categories as JSON arrays in facility table');
    console.log('📝 Example: states_covered = ["NSW", "VIC", "QLD"]');
    console.log('📝 Example: categories = ["Aged Care", "Residential Care"]');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Removing states_covered and categories columns from facility table...');
    
    await queryRunner.dropColumn('facility', 'categories');
    await queryRunner.dropColumn('facility', 'states_covered');
    
    console.log('✅ Columns removed successfully');
  }
}
