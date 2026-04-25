import 'reflect-metadata';
import { createConnection, getManager } from 'typeorm';
import * as readline from 'readline';

/**
 * Script to update location (latitude/longitude) for students and facilities
 * Usage:
 *   npm run ts-node scripts/update-locations.ts
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateFacilityLocation(facilityId: number, latitude: number, longitude: number) {
  const manager = getManager();
  
  try {
    // Update facility location using raw SQL
    await manager.query(
      `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
      [longitude, latitude, facilityId]
    );
    
    console.log(`✅ Updated facility ${facilityId} location to (${latitude}, ${longitude})`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating facility ${facilityId}:`, error.message);
    return false;
  }
}

async function updateStudentLocation(studentId: number, latitude: number, longitude: number) {
  const manager = getManager();
  
  try {
    // Update student location using raw SQL
    await manager.query(
      `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
      [longitude, latitude, studentId]
    );
    
    console.log(`✅ Updated student ${studentId} location to (${latitude}, ${longitude})`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating student ${studentId}:`, error.message);
    return false;
  }
}

async function bulkUpdateFacilities(data: Array<{ id: number; lat: number; lng: number }>) {
  let successCount = 0;
  let failCount = 0;
  
  for (const item of data) {
    const success = await updateFacilityLocation(item.id, item.lat, item.lng);
    if (success) successCount++;
    else failCount++;
  }
  
  console.log(`\n📊 Bulk Update Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
}

async function bulkUpdateStudents(data: Array<{ id: number; lat: number; lng: number }>) {
  let successCount = 0;
  let failCount = 0;
  
  for (const item of data) {
    const success = await updateStudentLocation(item.id, item.lat, item.lng);
    if (success) successCount++;
    else failCount++;
  }
  
  console.log(`\n📊 Bulk Update Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
}

async function listEntitiesWithoutLocation() {
  const manager = getManager();
  
  console.log('\n🔍 Checking entities without location set...\n');
  
  // Facilities without location
  const facilities = await manager.query(`
    SELECT facility_id, organization_name, 
           ST_X(location) as longitude, 
           ST_Y(location) as latitude
    FROM facility 
    WHERE isDeleted = 0 
      AND (location IS NULL OR (ST_X(location) = 0 AND ST_Y(location) = 0))
    LIMIT 10
  `);
  
  console.log(`📍 Facilities without location (showing first 10):`);
  if (facilities.length === 0) {
    console.log('   ✅ All facilities have location set');
  } else {
    facilities.forEach((f: any) => {
      console.log(`   - ID: ${f.facility_id}, Name: ${f.organization_name}`);
    });
  }
  
  // Students without location
  const students = await manager.query(`
    SELECT student_id, first_name, last_name,
           ST_X(location) as longitude, 
           ST_Y(location) as latitude
    FROM students 
    WHERE isDeleted = 0 
      AND (location IS NULL OR (ST_X(location) = 0 AND ST_Y(location) = 0))
    LIMIT 10
  `);
  
  console.log(`\n📍 Students without location (showing first 10):`);
  if (students.length === 0) {
    console.log('   ✅ All students have location set');
  } else {
    students.forEach((s: any) => {
      console.log(`   - ID: ${s.student_id}, Name: ${s.first_name} ${s.last_name}`);
    });
  }
}

async function interactiveMode() {
  console.log('\n🌍 Location Update Script - Interactive Mode\n');
  
  const entityType = await question('Update (1) Facility or (2) Student? Enter 1 or 2: ');
  
  if (entityType !== '1' && entityType !== '2') {
    console.log('❌ Invalid choice. Exiting.');
    return;
  }
  
  const id = await question('Enter ID: ');
  const latitude = await question('Enter Latitude (-90 to 90): ');
  const longitude = await question('Enter Longitude (-180 to 180): ');
  
  const idNum = parseInt(id);
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  // Validate inputs
  if (isNaN(idNum) || isNaN(lat) || isNaN(lng)) {
    console.log('❌ Invalid input. Please enter valid numbers.');
    return;
  }
  
  if (lat < -90 || lat > 90) {
    console.log('❌ Invalid latitude. Must be between -90 and 90.');
    return;
  }
  
  if (lng < -180 || lng > 180) {
    console.log('❌ Invalid longitude. Must be between -180 and 180.');
    return;
  }
  
  if (entityType === '1') {
    await updateFacilityLocation(idNum, lat, lng);
  } else {
    await updateStudentLocation(idNum, lat, lng);
  }
}

async function sampleDataMode() {
  console.log('\n🌍 Location Update Script - Sample Data Mode\n');
  console.log('This will update sample facilities and students with Sydney area coordinates.\n');
  
  const confirm = await question('Continue? (y/n): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return;
  }
  
  // Sample Sydney area coordinates
  const sampleFacilities = [
    { id: 1, lat: -33.8688, lng: 151.2093 }, // Sydney CBD
    { id: 2, lat: -33.8908, lng: 151.2743 }, // Bondi
    { id: 3, lat: -33.8650, lng: 151.2094 }, // Circular Quay
  ];
  
  const sampleStudents = [
    { id: 1, lat: -33.8700, lng: 151.2100 }, // Near CBD
    { id: 2, lat: -33.8750, lng: 151.2150 }, // Near CBD
    { id: 3, lat: -33.8920, lng: 151.2750 }, // Near Bondi
  ];
  
  console.log('\n📍 Updating facilities...');
  await bulkUpdateFacilities(sampleFacilities);
  
  console.log('\n📍 Updating students...');
  await bulkUpdateStudents(sampleStudents);
}

async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await createConnection();
    console.log('✅ Connected to database\n');
    
    console.log('='.repeat(60));
    console.log('  LOCATION UPDATE SCRIPT');
    console.log('='.repeat(60));
    
    console.log('\nChoose an option:');
    console.log('1. Interactive mode (update one entity)');
    console.log('2. Sample data mode (update sample entities)');
    console.log('3. List entities without location');
    console.log('4. Exit');
    
    const choice = await question('\nEnter your choice (1-4): ');
    
    switch (choice) {
      case '1':
        await interactiveMode();
        break;
      case '2':
        await sampleDataMode();
        break;
      case '3':
        await listEntitiesWithoutLocation();
        break;
      case '4':
        console.log('Exiting...');
        break;
      default:
        console.log('❌ Invalid choice');
    }
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
