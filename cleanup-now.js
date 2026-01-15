// Quick script to manually cleanup expired OTPs
require('dotenv').config();
require('reflect-metadata');

const { createConnection } = require('typeorm');

async function cleanupNow() {
  console.log('🧹 Starting manual cleanup of expired OTPs...\n');

  try {
    // Connect to database
    const connection = await createConnection();
    console.log('✅ Connected to database\n');

    // Run the cleanup query directly
    const result = await connection.query(`
      DELETE FROM password_resets
      WHERE expiry < NOW()
    `);

    const deletedCount = result.affectedRows || 0;

    if (deletedCount > 0) {
      console.log(`✅ Deleted ${deletedCount} expired OTP record(s)`);
    } else {
      console.log('✅ No expired OTP records found');
    }

    // Show remaining records
    const remaining = await connection.query(`
      SELECT 
        id,
        user_id,
        otp,
        expiry,
        CASE 
          WHEN expiry < NOW() THEN 'Expired'
          ELSE 'Valid'
        END as status,
        TIMESTAMPDIFF(MINUTE, NOW(), expiry) as minutes_remaining
      FROM password_resets
      ORDER BY expiry DESC
    `);

    console.log(`\n📊 Remaining OTP records: ${remaining.length}`);
    
    if (remaining.length > 0) {
      console.log('\nDetails:');
      remaining.forEach(record => {
        console.log(`  - ID: ${record.id}, User: ${record.user_id}, OTP: ${record.otp}, Status: ${record.status}, Minutes: ${record.minutes_remaining}`);
      });
    }

    await connection.close();
    console.log('\n✅ Cleanup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupNow();
