import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRemainingSeatsToPlacements1741100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add remaining_seats column to placement_slots table
    await queryRunner.addColumn(
      'placement_slots',
      new TableColumn({
        name: 'remaining_seats',
        type: 'int',
        isNullable: true,
        comment: 'Number of remaining seats available for booking'
      })
    );

    // Initialize remaining_seats with total_slots_offered for existing records
    await queryRunner.query(`
      UPDATE placement_slots 
      SET remaining_seats = total_slots_offered 
      WHERE total_slots_offered IS NOT NULL
    `);

    // For slots with existing assignments, calculate actual remaining seats
    await queryRunner.query(`
      UPDATE placement_slots ps
      SET remaining_seats = GREATEST(0, COALESCE(ps.total_slots_offered, 0) - (
        SELECT COUNT(*) 
        FROM placement_assignments pa 
        WHERE pa.placementslot_id = ps.placementslot_id 
        AND pa.status IN ('Assigned', 'Active')
      ))
      WHERE ps.total_slots_offered IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove remaining_seats column
    await queryRunner.dropColumn('placement_slots', 'remaining_seats');
  }
}
