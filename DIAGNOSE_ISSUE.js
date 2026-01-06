#!/usr/bin/env node

/**
 * Diagnostic Script to Check Password Encryption Setup
 * Run this to verify everything is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║         PASSWORD ENCRYPTION DIAGNOSTIC SCRIPT                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let issuesFound = 0;

// Check 1: Verify password.utility.ts exists
console.log('✓ Check 1: Verify password.utility.ts exists');
const passwordUtilityPath = path.join(__dirname, 'src/utilities/password.utility.ts');
if (fs.existsSync(passwordUtilityPath)) {
  console.log('  ✅ password.utility.ts found\n');
} else {
  console.log('  ❌ password.utility.ts NOT found\n');
  issuesFound++;
}

// Check 2: Verify user.service.ts imports PasswordUtility
console.log('✓ Check 2: Verify user.service.ts imports PasswordUtility');
const userServicePath = path.join(__dirname, 'src/services/user/user.service.ts');
if (fs.existsSync(userServicePath)) {
  const content = fs.readFileSync(userServicePath, 'utf8');
  if (content.includes('import PasswordUtility')) {
    console.log('  ✅ PasswordUtility imported in user.service.ts\n');
  } else {
    console.log('  ❌ PasswordUtility NOT imported in user.service.ts\n');
    issuesFound++;
  }
} else {
  console.log('  ❌ user.service.ts NOT found\n');
  issuesFound++;
}

// Check 3: Verify user.service.ts uses hashPassword
console.log('✓ Check 3: Verify user.service.ts uses hashPassword');
if (fs.existsSync(userServicePath)) {
  const content = fs.readFileSync(userServicePath, 'utf8');
  if (content.includes('PasswordUtility.hashPassword')) {
    console.log('  ✅ hashPassword is being called in user.service.ts\n');
  } else {
    console.log('  ❌ hashPassword is NOT being called in user.service.ts\n');
    issuesFound++;
  }
}

// Check 4: Verify bcrypt is installed
console.log('✓ Check 4: Verify bcrypt is installed');
try {
  require('bcrypt');
  console.log('  ✅ bcrypt module is installed\n');
} catch (e) {
  console.log('  ❌ bcrypt module is NOT installed\n');
  console.log('  Run: npm install bcrypt@5.1.1\n');
  issuesFound++;
}

// Check 5: Verify @types/bcrypt is installed
console.log('✓ Check 5: Verify @types/bcrypt is installed');
try {
  require('@types/bcrypt');
  console.log('  ✅ @types/bcrypt is installed\n');
} catch (e) {
  console.log('  ⚠️  @types/bcrypt might not be installed (dev dependency)\n');
}

// Check 6: Verify user.entity.ts has password methods
console.log('✓ Check 6: Verify user.entity.ts has password methods');
const userEntityPath = path.join(__dirname, 'src/entities/user/user.entity.ts');
if (fs.existsSync(userEntityPath)) {
  const content = fs.readFileSync(userEntityPath, 'utf8');
  if (content.includes('verifyPassword') && content.includes('PasswordUtility')) {
    console.log('  ✅ Password methods found in user.entity.ts\n');
  } else {
    console.log('  ⚠️  Password methods might be missing in user.entity.ts\n');
  }
}

// Check 7: Verify user.controller.ts exists
console.log('✓ Check 7: Verify user.controller.ts exists');
const userControllerPath = path.join(__dirname, 'src/controllers/user/user.controller.ts');
if (fs.existsSync(userControllerPath)) {
  console.log('  ✅ user.controller.ts found\n');
} else {
  console.log('  ❌ user.controller.ts NOT found\n');
  issuesFound++;
}

// Check 8: Verify user.route.ts has POST endpoint
console.log('✓ Check 8: Verify user.route.ts has POST endpoint');
const userRoutePath = path.join(__dirname, 'src/routes/user/user.route.ts');
if (fs.existsSync(userRoutePath)) {
  const content = fs.readFileSync(userRoutePath, 'utf8');
  if (content.includes('router.post') || content.includes('POST')) {
    console.log('  ✅ POST endpoint found in user.route.ts\n');
  } else {
    console.log('  ⚠️  POST endpoint might be missing in user.route.ts\n');
  }
}

// Check 9: Verify validation schema
console.log('✓ Check 9: Verify validation schema has password validation');
const schemaPath = path.join(__dirname, 'src/validations/schemas/user.schema.ts');
if (fs.existsSync(schemaPath)) {
  const content = fs.readFileSync(schemaPath, 'utf8');
  if (content.includes('createUser') && content.includes('password')) {
    console.log('  ✅ Password validation schema found\n');
  } else {
    console.log('  ⚠️  Password validation schema might be incomplete\n');
  }
}

// Check 10: Verify dist directory exists
console.log('✓ Check 10: Verify dist directory exists');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('  ✅ dist directory exists\n');
  
  // Check if compiled files exist
  const compiledServicePath = path.join(distPath, 'services/user/user.service.js');
  if (fs.existsSync(compiledServicePath)) {
    console.log('  ✅ Compiled user.service.js exists\n');
    
    // Check if compiled file has bcrypt or PasswordUtility
    const compiledContent = fs.readFileSync(compiledServicePath, 'utf8');
    if (compiledContent.includes('hashPassword') || compiledContent.includes('password_utility')) {
      console.log('  ✅ Compiled file contains password encryption code\n');
    } else {
      console.log('  ❌ Compiled file does NOT contain password encryption code\n');
      console.log('  Solution: Delete dist folder and rebuild\n');
      issuesFound++;
    }
  } else {
    console.log('  ⚠️  Compiled user.service.js not found\n');
    console.log('  Solution: Run npm run build\n');
  }
} else {
  console.log('  ⚠️  dist directory does not exist\n');
  console.log('  Solution: Run npm run build\n');
}

// Summary
console.log('╔════════════════════════════════════════════════════════════════╗');
if (issuesFound === 0) {
  console.log('║                    ✅ ALL CHECKS PASSED                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log('Your password encryption setup looks good!\n');
  console.log('If passwords are still not encrypted:\n');
  console.log('1. Stop the server (Ctrl+C)\n');
  console.log('2. Delete dist folder: rmdir /s /q dist\n');
  console.log('3. Kill node processes: taskkill /F /IM node.exe\n');
  console.log('4. Start again: npm run dev\n');
} else {
  console.log(`║                  ❌ ${issuesFound} ISSUE(S) FOUND                        ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log('Please fix the issues above and try again.\n');
}

process.exit(issuesFound > 0 ? 1 : 0);