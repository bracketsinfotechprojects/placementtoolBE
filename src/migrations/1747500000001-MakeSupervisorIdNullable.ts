import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeSupervisorIdNullable1747500000001 implements MigrationInterface {
  name = 'MakeSupervisorIdNullable1747500000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Making supervisor_id nullable in facility_supervisor_complaints...');

    await queryRunner.query(`
      ALTER TABLE \`facility_supervisor_complaints\` 
      MODIFY COLUMN \`supervisor_id\` int NULL COMMENT 'Foreign key to facility supervisors table'
    `);

    console.log('✅ supervisor_id is now nullable');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Reverting supervisor_id to NOT NULL...');

    await queryRunner.query(`
      ALTER TABLE \`facility_supervisor_complaints\` 
      MODIFY COLUMN \`supervisor_id\` int NOT NULL COMMENT 'Foreign key to facility supervisors table'
    `);

    console.log('✅ supervisor_id reverted to NOT NULL');
  }
}
