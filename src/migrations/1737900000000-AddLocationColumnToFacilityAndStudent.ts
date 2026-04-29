import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationColumnToFacilityAndStudent1737900000000 implements MigrationInterface {
  name = 'AddLocationColumnToFacilityAndStudent1737900000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Adding location column to facility and students tables...');

    // Check and add location column to facility table
    const facilityColumns = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'facility' 
        AND COLUMN_NAME = 'location'
    `);

    if (facilityColumns.length === 0) {
      // Add column as nullable first
      await queryRunner.query(`
        ALTER TABLE \`facility\`
        ADD COLUMN \`location\` POINT NULL
        COMMENT 'Geographic location (latitude, longitude) of the facility. Default POINT(0,0) means location not set.'
      `);
      
      // Set default value for all rows
      await queryRunner.query(`
        UPDATE \`facility\` 
        SET \`location\` = POINT(0, 0)
      `);
      
      // Now make it NOT NULL
      await queryRunner.query(`
        ALTER TABLE \`facility\`
        MODIFY COLUMN \`location\` POINT NOT NULL
        COMMENT 'Geographic location (latitude, longitude) of the facility. Default POINT(0,0) means location not set.'
      `);
      
      console.log('✅ Added location column to facility table');
    } else {
      // If column exists but is NULL, alter it to NOT NULL for spatial index
      const columnInfo = await queryRunner.query(`
        SELECT IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'facility' 
          AND COLUMN_NAME = 'location'
      `);
      
      if (columnInfo[0] && columnInfo[0].IS_NULLABLE === 'YES') {
        console.log('ℹ️  Modifying location column to NOT NULL for spatial indexing...');
        // Set default value for existing NULL values
        await queryRunner.query(`
          UPDATE \`facility\` 
          SET \`location\` = POINT(0, 0) 
          WHERE \`location\` IS NULL
        `);
        await queryRunner.query(`
          ALTER TABLE \`facility\`
          MODIFY COLUMN \`location\` POINT NOT NULL
          COMMENT 'Geographic location (latitude, longitude) of the facility. Default POINT(0,0) means location not set.'
        `);
        console.log('✅ Modified location column to NOT NULL');
      } else {
        console.log('ℹ️  Location column already exists in facility table');
      }
    }

    // Check and add location column to students table
    const studentColumns = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND COLUMN_NAME = 'location'
    `);

    if (studentColumns.length === 0) {
      // Add column as nullable first
      await queryRunner.query(`
        ALTER TABLE \`students\`
        ADD COLUMN \`location\` POINT NULL
        COMMENT 'Geographic location (latitude, longitude) of the student. Default POINT(0,0) means location not set.'
      `);
      
      // Set default value for all rows
      await queryRunner.query(`
        UPDATE \`students\` 
        SET \`location\` = POINT(0, 0)
      `);
      
      // Now make it NOT NULL
      await queryRunner.query(`
        ALTER TABLE \`students\`
        MODIFY COLUMN \`location\` POINT NOT NULL
        COMMENT 'Geographic location (latitude, longitude) of the student. Default POINT(0,0) means location not set.'
      `);
      
      console.log('✅ Added location column to students table');
    } else {
      // If column exists but is NULL, alter it to NOT NULL for spatial index
      const columnInfo = await queryRunner.query(`
        SELECT IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'students' 
          AND COLUMN_NAME = 'location'
      `);
      
      if (columnInfo[0] && columnInfo[0].IS_NULLABLE === 'YES') {
        console.log('ℹ️  Modifying location column to NOT NULL for spatial indexing...');
        // Set default value for existing NULL values
        await queryRunner.query(`
          UPDATE \`students\` 
          SET \`location\` = POINT(0, 0) 
          WHERE \`location\` IS NULL
        `);
        await queryRunner.query(`
          ALTER TABLE \`students\`
          MODIFY COLUMN \`location\` POINT NOT NULL
          COMMENT 'Geographic location (latitude, longitude) of the student. Default POINT(0,0) means location not set.'
        `);
        console.log('✅ Modified location column to NOT NULL');
      } else {
        console.log('ℹ️  Location column already exists in students table');
      }
    }

    // Check and add spatial index for facility location
    const facilityIndexes = await queryRunner.query(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'facility' 
        AND INDEX_NAME = 'IDX_facility_location'
    `);

    if (facilityIndexes.length === 0) {
      await queryRunner.query(`
        CREATE SPATIAL INDEX \`IDX_facility_location\` ON \`facility\` (\`location\`)
      `);
      console.log('✅ Added spatial index on facility.location');
    } else {
      console.log('ℹ️  Spatial index already exists on facility.location');
    }

    // Check and add spatial index for students location
    const studentIndexes = await queryRunner.query(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND INDEX_NAME = 'IDX_students_location'
    `);

    if (studentIndexes.length === 0) {
      await queryRunner.query(`
        CREATE SPATIAL INDEX \`IDX_students_location\` ON \`students\` (\`location\`)
      `);
      console.log('✅ Added spatial index on students.location');
    } else {
      console.log('ℹ️  Spatial index already exists on students.location');
    }

    console.log('🎉 Location columns migration completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Removing location columns from facility and students tables...');

    // Drop spatial indexes first (if they exist)
    const facilityIndexes = await queryRunner.query(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'facility' 
        AND INDEX_NAME = 'IDX_facility_location'
    `);

    if (facilityIndexes.length > 0) {
      await queryRunner.query('DROP INDEX `IDX_facility_location` ON `facility`');
      console.log('✅ Dropped spatial index from facility');
    }

    const studentIndexes = await queryRunner.query(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND INDEX_NAME = 'IDX_students_location'
    `);

    if (studentIndexes.length > 0) {
      await queryRunner.query('DROP INDEX `IDX_students_location` ON `students`');
      console.log('✅ Dropped spatial index from students');
    }

    // Drop location columns (if they exist)
    const facilityColumns = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'facility' 
        AND COLUMN_NAME = 'location'
    `);

    if (facilityColumns.length > 0) {
      await queryRunner.query('ALTER TABLE `facility` DROP COLUMN `location`');
      console.log('✅ Dropped location column from facility');
    }

    const studentColumns = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'students' 
        AND COLUMN_NAME = 'location'
    `);

    if (studentColumns.length > 0) {
      await queryRunner.query('ALTER TABLE `students` DROP COLUMN `location`');
      console.log('✅ Dropped location column from students');
    }

    console.log('✅ Location columns removed successfully');
  }
}
