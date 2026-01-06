const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function syncStudentsWithUsers() {
  let connection;
  
  try {
    console.log('🔄 Syncing students with user accounts...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm'
    });

    console.log('✅ Database connection established');

    // Step 1: Get all students who don't have corresponding user accounts
    const [studentsWithoutUsers] = await connection.query(`
      SELECT s.student_id, s.first_name, s.last_name, s.status, cd.email
      FROM students s
      LEFT JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
      LEFT JOIN users u ON u.loginID = cd.email
      WHERE u.id IS NULL
      ORDER BY s.student_id
    `);

    if (studentsWithoutUsers.length === 0) {
      console.log('ℹ️  All students already have user accounts!');
      return;
    }

    console.log(`📝 Found ${studentsWithoutUsers.length} students without user accounts:`);

    // Step 2: Get the Student role ID
    const [roles] = await connection.query(
      'SELECT role_id FROM roles WHERE role_name = ?',
      ['Student']
    );

    if (roles.length === 0) {
      throw new Error('Student role not found in database');
    }

    const studentRoleId = roles[0].role_id;
    console.log(`🏷️  Student role ID: ${studentRoleId}`);

    // Step 3: Create user accounts for each student
    let createdCount = 0;
    
    for (const student of studentsWithoutUsers) {
      try {
        // Check if student has email
        if (!student.email) {
          console.log(`  ⚠️  Student ${student.first_name} ${student.last_name} (ID: ${student.student_id}) has no email, skipping...`);
          continue;
        }
        
        const loginID = student.email;
        const hashedPassword = await bcrypt.hash('test123', 10); // Use standard test password
        
        // Create user account
        const [userResult] = await connection.query(
          'INSERT INTO users (loginID, password, userRole, status) VALUES (?, ?, ?, ?)',
          [loginID, hashedPassword, 'Student', student.status]
        );
        
        const userId = userResult.insertId;
        
        // Link user to Student role
        await connection.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, studentRoleId]
        );
        
        console.log(`  ✅ Created user account for ${student.first_name} ${student.last_name} (ID: ${student.student_id}) -> ${loginID}`);
        createdCount++;
        
      } catch (error) {
        console.error(`  ❌ Error creating user for student ${student.student_id}:`, error.message);
      }
    }

    // Step 4: Verify the synchronization
    console.log('\n📊 Verification:');
    
    const [syncResults] = await connection.query(`
      SELECT 
        'Students' as type,
        COUNT(*) as total_count
      FROM students
      UNION ALL
      SELECT 
        'Student Users' as type,
        COUNT(*) as total_count
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE r.role_name = 'Student'
    `);
    
    syncResults.forEach(result => {
      console.log(`  📈 ${result.type}: ${result.total_count}`);
    });

    // Step 5: Show sample student-user mappings
    console.log('\n👥 Sample Student-User Mappings:');
    const [studentUserMappings] = await connection.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        cd.email,
        u.loginID,
        u.status as user_status
      FROM students s
      JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
      JOIN users u ON u.loginID = cd.email
      ORDER BY s.student_id
      LIMIT 5
    `);
    
    studentUserMappings.forEach(mapping => {
      console.log(`  🎓 ${mapping.first_name} ${mapping.last_name} (ID: ${mapping.student_id}) -> ${mapping.loginID} (${mapping.user_status})`);
    });

    console.log(`\n🎉 Successfully synchronized ${createdCount} students with user accounts!`);
    console.log('\n🔑 Student Login Credentials:');
    console.log('  Login ID: Student email address');
    console.log('  Password: test123');
    console.log('  Example: john.doe@email.com / test123');

  } catch (error) {
    console.error('❌ Error syncing students with users:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the synchronization
syncStudentsWithUsers();