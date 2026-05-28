import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertPointToGeometry1737900000001 implements MigrationInterface {
  name = 'ConvertPointToGeometry1737900000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Converting location columns from POINT to GEOMETRY...');

    // Check if facility location column exists and its current type
    const facilityLocationInfo = await queryRunner.query(`
      SELECT COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'facility' 
        AND COLUMN_NAME = 'location'
    `);

    if (facilityLocationInfo.length > 0) {
      const currentType = facilityLocationInfo[0].COLUMN_TYPE;
      // Only convert if it's currently POINT type
      if (currentType === 'point') {
        await queryRunner.query(`
          ALTER TABLE \`facility\`
          MODIFY COLUMN \`location\` GEOMETRY NOT NULL
          COMMENT 'Geographic location (latitude, longitude) of the facility. Default POINT(0,0) means location not set.'
        `);
        console.log('✅ Converted facility.location to GEOMETRY');
      } else {
        console.log('ℹ️  facility.location is already GEOMETRY type');
      }
    }

    // Check if students location column exists and its current type
    const studentLocationInfo = await queryRunner.query(`
      SELECT COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND COLUMN_NAME = 'location'
    `);

    if (studentLocationInfo.length > 0) {
      const currentType = studentLocationInfo[0].COLUMN_TYPE;
      // Only convert if it's currently POINT type
      if (currentType === 'point') {
        await queryRunner.query(`
          ALTER TABLE \`students\`
          MODIFY COLUMN \`location\` GEOMETRY NOT NULL
          COMMENT 'Geographic location (latitude, longitude) of the student. Default POINT(0,0) means location not set.'
        `);
        console.log('✅ Converted students.location to GEOMETRY');
      } else {
        console.log('ℹ️  students.location is already GEOMETRY type');
      }
    }

    console.log('🎉 Location columns conversion completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Reverting location columns from GEOMETRY to POINT...');

    // Check if facility location column exists and its current type
    const facilityLocationInfo = await queryRunner.query(`
      SELECT COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'facility' 
        AND COLUMN_NAME = 'location'
    `);

    if (facilityLocationInfo.length > 0) {
      const currentType = facilityLocationInfo[0].COLUMN_TYPE;
      // Only revert if it's currently GEOMETRY type
      if (currentType === 'geometry') {
        await queryRunner.query(`
          ALTER TABLE \`facility\`
          MODIFY COLUMN \`location\` POINT NOT NULL
          COMMENT 'Geographic location (latitude, longitude) of the facility. Default POINT(0,0) means location not set.'
        `);
        console.log('✅ Reverted facility.location to POINT');
      } else {
        console.log('ℹ️  facility.location is already POINT type');
      }
    }

    // Check if students location column exists and its current type
    const studentLocationInfo = await queryRunner.query(`
      SELECT COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND COLUMN_NAME = 'location'
    `);

    if (studentLocationInfo.length > 0) {
      const currentType = studentLocationInfo[0].COLUMN_TYPE;
      // Only revert if it's currently GEOMETRY type
      if (currentType === 'geometry') {
        await queryRunner.query(`
          ALTER TABLE \`students\`
          MODIFY COLUMN \`location\` POINT NOT NULL
          COMMENT 'Geographic location (latitude, longitude) of the student. Default POINT(0,0) means location not set.'
        `);
        console.log('✅ Reverted students.location to POINT');
      } else {
        console.log('ℹ️  students.location is already POINT type');
      }
    }

    console.log('✅ Location columns revert completed successfully');
  }
}
