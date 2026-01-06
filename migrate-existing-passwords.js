const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Migration script to hash existing plain text passwords in the users table
 * This should be run once after implementing bcrypt password encryption
 */

const SALT_ROUNDS = 12;

async function migratePasswords() {
  let connection;
  
  try {
    console.log('🔄 Starting password migration...\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'student_crm',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Get all users with their current passwords
    const [users] = await connection.execute(
      'SELECT id, loginID, password FROM users WHERE status = "active"'
    );

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found in database');
      return;
    }

    console.log(`📊 Found ${users.length} users to process\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
          console.log(`⏭️  User ${user.loginID} (ID: ${user.id}) - Password already hashed, skipping`);
          skippedCount++;
          continue;
        }

        // Hash the plain text password
        console.log(`🔐 Hashing password for user ${user.loginID} (ID: ${user.id})...`);
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

        // Update the user's password in the database
        await connection.execute(
          'UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?',
          [hashedPassword, user.id]
        );

        console.log(`✅ Successfully updated password for user ${user.loginID}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error processing user ${user.loginID} (ID: ${user.id}):`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total users processed: ${users.length}`);
    console.log(`   Passwords migrated: ${migratedCount}`);
    console.log(`   Already hashed (skipped): ${skippedCount}`);
    console.log(`   Errors: ${users.length - migratedCount - skippedCount}`);

    if (migratedCount > 0) {
      console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
      console.log('   1. All plain text passwords have been hashed with bcrypt');
      console.log('   2. Original passwords cannot be recovered');
      console.log('   3. Users can still login with their original passwords');
      console.log('   4. Consider notifying users to update their passwords');
      console.log('   5. Review and delete any password backups or logs');
    }

    console.log('\n🎉 Password migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Confirmation prompt
console.log('⚠️  PASSWORD MIGRATION SCRIPT');
console.log('This script will hash all plain text passwords in the users table.');
console.log('This operation cannot be undone!\n');

console.log('Environment:', {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'student_crm',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'root'
});

console.log('\nStarting migration in 3 seconds...');
setTimeout(() => {
  migratePasswords();
}, 3000);