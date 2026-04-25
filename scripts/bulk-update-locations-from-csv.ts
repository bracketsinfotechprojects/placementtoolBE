import 'reflect-metadata';
import { createConnection, getManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bulk update locations from CSV files
 * 
 * CSV Format for facilities.csv:
 * facility_id,latitude,longitude
 * 1,-33.8688,151.2093
 * 2,-33.8908,151.2743
 * 
 * CSV Format for students.csv:
 * student_id,latitude,longitude
 * 1,-33.8700,151.2100
 * 2,-33.8750,151.2150
 * 
 * Usage:
 *   ts-node scripts/bulk-update-locations-from-csv.ts facilities.csv
 *   ts-node scripts/bulk-update-locations-from-csv.ts students.csv
 */

interface LocationData {
  id: number;
  latitude: number;
  longitude: number;
}

function parseCSV(filePath: string): LocationData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const results: LocationData[] = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length < 3) {
      console.warn(`⚠️  Skipping invalid line ${i + 2}: ${line}`);
      continue;
    }
    
    const id = parseInt(parts[0].trim());
    const latitude = parseFloat(parts[1].trim());
    const longitude = parseFloat(parts[2].trim());
    
    if (isNaN(id) || isNaN(latitude) || isNaN(longitude)) {
      console.warn(`⚠️  Skipping invalid data at line ${i + 2}: ${line}`);
      continue;
    }
    
    if (latitude < -90 || latitude > 90) {
      console.warn(`⚠️  Invalid latitude at line ${i + 2}: ${latitude}`);
      continue;
    }
    
    if (longitude < -180 || longitude > 180) {
      console.warn(`⚠️  Invalid longitude at line ${i + 2}: ${longitude}`);
      continue;
    }
    
    results.push({ id, latitude, longitude });
  }
  
  return results;
}

async function updateFacilityLocations(data: LocationData[]) {
  const manager = getManager();
  let successCount = 0;
  let failCount = 0;
  
  console.log(`\n📍 Updating ${data.length} facilities...\n`);
  
  for (const item of data) {
    try {
      await manager.query(
        `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
        [item.longitude, item.latitude, item.id]
      );
      console.log(`✅ Facility ${item.id}: (${item.latitude}, ${item.longitude})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Facility ${item.id}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
}

async function updateStudentLocations(data: LocationData[]) {
  const manager = getManager();
  let successCount = 0;
  let failCount = 0;
  
  console.log(`\n📍 Updating ${data.length} students...\n`);
  
  for (const item of data) {
    try {
      await manager.query(
        `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
        [item.longitude, item.latitude, item.id]
      );
      console.log(`✅ Student ${item.id}: (${item.latitude}, ${item.longitude})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Student ${item.id}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Usage: ts-node scripts/bulk-update-locations-from-csv.ts <csv-file>');
    console.log('\nCSV Format:');
    console.log('  For facilities: facility_id,latitude,longitude');
    console.log('  For students: student_id,latitude,longitude');
    console.log('\nExample:');
    console.log('  ts-node scripts/bulk-update-locations-from-csv.ts facilities.csv');
    console.log('  ts-node scripts/bulk-update-locations-from-csv.ts students.csv');
    process.exit(1);
  }
  
  const csvFile = args[0];
  
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ File not found: ${csvFile}`);
    process.exit(1);
  }
  
  try {
    console.log('🔌 Connecting to database...');
    await createConnection();
    console.log('✅ Connected to database');
    
    console.log(`📄 Reading CSV file: ${csvFile}`);
    const data = parseCSV(csvFile);
    
    if (data.length === 0) {
      console.log('❌ No valid data found in CSV file');
      process.exit(1);
    }
    
    console.log(`✅ Parsed ${data.length} records`);
    
    // Determine entity type from filename
    const fileName = path.basename(csvFile).toLowerCase();
    
    if (fileName.includes('facility') || fileName.includes('facilities')) {
      await updateFacilityLocations(data);
    } else if (fileName.includes('student') || fileName.includes('students')) {
      await updateStudentLocations(data);
    } else {
      console.log('\n⚠️  Cannot determine entity type from filename.');
      console.log('Please name your file with "facility" or "student" in it.');
      console.log('Examples: facilities.csv, students.csv, facility-locations.csv');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
