import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertPointToGeometry1737900000001 implements MigrationInterface {
  name = 'ConvertPointToGeometry1737900000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Converting location columns from POINT to GEOMETRY...');

    // Convert facility location from POINT to GEOMETRY
    await queryRunner.query(`
      ALTER TABLE \`facility\`
      MODIFY COLUMN \`location\` GEOMETRY NULL
      COMMENT 'Geographic location (latitude, longitude) of the facility. Default POINT(0,0) means location not set.'
    `);
    console.log('✅ Converted facility.location to GEOMETRY');

    // Convert student location from POINT to GEOMETRY
    await queryRunner.query(`
      ALTER TABLE \`students\`
      MODIFY COLUMN \`location\` GEOMETRY NULL
      COMMENT 'Geographic location (latitude, longitude) of the student. Default POINT(0,0) means location not set.'
    `);
    console.log('✅ Converted students.location to GEOMETRY');

    console.log('🎉 Location columns conversion completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Reverting location columns from GEOMETRY to POINT...');

    // Revert back to POINT type if needed
    await queryRunner.query(`
      ALTER TABLE \`facility\`
      MODIFY COLUMN \`location\` POINT NULL
      COMMENT 'Geographic location (latitude, longitude) of the facility. Default POINT(0,0) means location not set.'
    `);
    console.log('✅ Reverted facility.location to POINT');

    await queryRunner.query(`
      ALTER TABLE \`students\`
      MODIFY COLUMN \`location\` POINT NULL
      COMMENT 'Geographic location (latitude, longitude) of the student. Default POINT(0,0) means location not set.'
    `);
    console.log('✅ Reverted students.location to POINT');

    console.log('✅ Location columns revert completed successfully');
  }
}
