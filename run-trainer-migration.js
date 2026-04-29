// Simple script to add columns to Trainer table
// Run with: node run-trainer-migration.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'Trainer' 
      AND COLUMN_NAME IN ('wwc_document', 'police_check_document')
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('⚠️  Columns already exist:', columns.map(c => c.COLUMN_NAME).join(', '));
      console.log('Skipping migration...');
      return;
    }

    console.log('🚀 Adding wwc_document column...');
    await connection.query(`
      ALTER TABLE \`Trainer\` 
      ADD COLUMN \`wwc_document\` varchar(255) NULL 
      COMMENT 'Path to Working With Children Check document file'
      AFTER \`wwc_expiry_date\`
    `);
    console.log('✅ wwc_document column added');

    console.log('🚀 Adding police_check_document column...');
    await connection.query(`
      ALTER TABLE \`Trainer\` 
      ADD COLUMN \`police_check_document\` varchar(255) NULL 
      COMMENT 'Path to Police Check document file'
      AFTER \`police_check_expiry_date\`
    `);
    console.log('✅ police_check_document column added');

    // Verify columns
    const [result] = await connection.query(`
      DESCRIBE \`Trainer\`
    `);
    
    console.log('\n📋 Trainer table structure:');
    const relevantColumns = result.filter(col => 
      ['wwc_expiry_date', 'wwc_document', 'police_check_number', 'police_check_expiry_date', 'police_check_document'].includes(col.Field)
    );
    console.table(relevantColumns);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();
