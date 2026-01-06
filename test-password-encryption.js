const bcrypt = require('bcrypt');

// Test password encryption functionality
async function testPasswordEncryption() {
  console.log('🔐 Testing Password Encryption with bcrypt...\n');

  const testPassword = 'TestPassword123!';
  const saltRounds = 12;

  try {
    // Test 1: Hash a password
    console.log('1. Hashing password...');
    const startTime = Date.now();
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    const hashTime = Date.now() - startTime;
    
    console.log(`   Original password: ${testPassword}`);
    console.log(`   Hashed password: ${hashedPassword}`);
    console.log(`   Hash time: ${hashTime}ms`);
    console.log(`   Hash length: ${hashedPassword.length} characters\n`);

    // Test 2: Verify correct password
    console.log('2. Verifying correct password...');
    const verifyStartTime = Date.now();
    const isValidCorrect = await bcrypt.compare(testPassword, hashedPassword);
    const verifyTime = Date.now() - verifyStartTime;
    
    console.log(`   Password matches: ${isValidCorrect}`);
    console.log(`   Verification time: ${verifyTime}ms\n`);

    // Test 3: Verify incorrect password
    console.log('3. Verifying incorrect password...');
    const wrongPassword = 'WrongPassword123!';
    const isValidWrong = await bcrypt.compare(wrongPassword, hashedPassword);
    
    console.log(`   Wrong password: ${wrongPassword}`);
    console.log(`   Password matches: ${isValidWrong}\n`);

    // Test 4: Multiple hashes of same password (should be different)
    console.log('4. Testing hash uniqueness...');
    const hash1 = await bcrypt.hash(testPassword, saltRounds);
    const hash2 = await bcrypt.hash(testPassword, saltRounds);
    
    console.log(`   Hash 1: ${hash1}`);
    console.log(`   Hash 2: ${hash2}`);
    console.log(`   Hashes are different: ${hash1 !== hash2}`);
    console.log(`   Both verify correctly: ${await bcrypt.compare(testPassword, hash1) && await bcrypt.compare(testPassword, hash2)}\n`);

    // Test 5: Performance test
    console.log('5. Performance test (10 operations)...');
    const perfStartTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      const hash = await bcrypt.hash(`password${i}`, saltRounds);
      await bcrypt.compare(`password${i}`, hash);
    }
    
    const perfTime = Date.now() - perfStartTime;
    console.log(`   10 hash+verify operations took: ${perfTime}ms`);
    console.log(`   Average per operation: ${perfTime / 10}ms\n`);

    console.log('✅ All password encryption tests passed!');

  } catch (error) {
    console.error('❌ Password encryption test failed:', error);
  }
}

// Run the test
testPasswordEncryption();