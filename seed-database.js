const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedDatabase() {
  let connection;
  
  try {
    console.log('🌱 Starting database seeding...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm'
    });

    console.log('✅ Database connection established');

    // ==============================================
    // SEED ROLES
    // ==============================================
    
    console.log('📝 Seeding roles...');
    
    const roles = ['Admin', 'Facility', 'Supervisor', 'Placement Executive', 'Trainer', 'Student'];
    
    for (const roleName of roles) {
      try {
        await connection.query(
          'INSERT IGNORE INTO roles (role_name) VALUES (?)',
          [roleName]
        );
        console.log(`  ✅ Role '${roleName}' added`);
      } catch (error) {
        console.log(`  ⚠️  Role '${roleName}' might already exist`);
      }
    }

    // ==============================================
    // SEED USERS (with hashed passwords)
    // ==============================================
    
    console.log('\n👥 Seeding users...');
    
    // Define users with their roles and plain passwords (all using test123)
    const users = [
      { loginID: 'admin', password: 'test123', userRole: 'Admin', status: 'active' },
      { loginID: 'facility_manager', password: 'test123', userRole: 'Facility', status: 'active' },
      { loginID: 'supervisor_john', password: 'test123', userRole: 'Supervisor', status: 'active' },
      { loginID: 'placement_executive', password: 'test123', userRole: 'Placement Executive', status: 'active' },
      { loginID: 'trainer_mary', password: 'test123', userRole: 'Trainer', status: 'active' },
      { loginID: 'student_demo', password: 'test123', userRole: 'Student', status: 'active' },
      { loginID: 'test_user', password: 'test123', userRole: 'user', status: 'active' },
      { loginID: 'inactive_user', password: 'test123', userRole: 'user', status: 'inactive' }
    ];

    const userIds = {};
    
    for (const user of users) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        const [result] = await connection.query(
          'INSERT IGNORE INTO users (loginID, password, userRole, status) VALUES (?, ?, ?, ?)',
          [user.loginID, hashedPassword, user.userRole, user.status]
        );
        
        if (result.insertId) {
          userIds[user.loginID] = result.insertId;
          console.log(`  ✅ User '${user.loginID}' added (ID: ${result.insertId})`);
        } else {
          // User already exists, get their ID
          const [existing] = await connection.query(
            'SELECT id FROM users WHERE loginID = ?',
            [user.loginID]
          );
          if (existing.length > 0) {
            userIds[user.loginID] = existing[0].id;
            console.log(`  ℹ️  User '${user.loginID}' already exists (ID: ${existing[0].id})`);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error adding user '${user.loginID}':`, error.message);
      }
    }

    // ==============================================
    // SEED USER_ROLES (Junction Table)
    // ==============================================
    
    console.log('\n🔗 Seeding user_roles...');
    
    // Map users to their roles
    const userRoleMappings = [
      { userLoginID: 'admin', roleName: 'Admin' },
      { userLoginID: 'admin', roleName: 'Trainer' }, // Admin can also be trainer
      { userLoginID: 'facility_manager', roleName: 'Facility' },
      { userLoginID: 'supervisor_john', roleName: 'Supervisor' },
      { userLoginID: 'placement_executive', roleName: 'Placement Executive' },
      { userLoginID: 'trainer_mary', roleName: 'Trainer' },
      { userLoginID: 'student_demo', roleName: 'Student' },
      { userLoginID: 'test_user', roleName: 'user' },
      { userLoginID: 'inactive_user', roleName: 'user' }
    ];

    for (const mapping of userRoleMappings) {
      try {
        if (userIds[mapping.userLoginID]) {
          // Get role ID
          const [roles] = await connection.query(
            'SELECT role_id FROM roles WHERE role_name = ?',
            [mapping.roleName]
          );
          
          if (roles.length > 0) {
            const roleId = roles[0].role_id;
            const userId = userIds[mapping.userLoginID];
            
            await connection.query(
              'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
              [userId, roleId]
            );
            
            console.log(`  ✅ Mapped '${mapping.userLoginID}' -> '${mapping.roleName}'`);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error mapping '${mapping.userLoginID}' -> '${mapping.roleName}':`, error.message);
      }
    }

    // ==============================================
    // SEED SAMPLE STUDENTS
    // ==============================================
    
    console.log('\n🎓 Seeding sample students...');
    
    const students = [
      { first_name: 'John', last_name: 'Doe', dob: '2000-05-15', gender: 'Male', nationality: 'Canadian', student_type: 'domestic', status: 'active' },
      { first_name: 'Jane', last_name: 'Smith', dob: '1999-08-22', gender: 'Female', nationality: 'International', student_type: 'international', status: 'active' },
      { first_name: 'Mike', last_name: 'Johnson', dob: '2001-02-10', gender: 'Male', nationality: 'Canadian', student_type: 'domestic', status: 'active' },
      { first_name: 'Sarah', last_name: 'Wilson', dob: '2000-12-03', gender: 'Female', nationality: 'International', student_type: 'international', status: 'active' },
      { first_name: 'David', last_name: 'Brown', dob: '1999-09-18', gender: 'Male', nationality: 'Canadian', student_type: 'domestic', status: 'graduated' }
    ];

    for (const student of students) {
      try {
        await connection.query(
          'INSERT IGNORE INTO students (first_name, last_name, dob, gender, nationality, student_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [student.first_name, student.last_name, student.dob, student.gender, student.nationality, student.student_type, student.status]
        );
        console.log(`  ✅ Student '${student.first_name} ${student.last_name}' added`);
      } catch (error) {
        console.error(`  ❌ Error adding student '${student.first_name} ${student.last_name}':`, error.message);
      }
    }

    // ==============================================
    // VERIFICATION
    // ==============================================
    
    console.log('\n📊 Verification Results:');
    
    // Check record counts
    const [counts] = await connection.query(`
      SELECT 'ROLES' as table_name, COUNT(*) as record_count FROM roles
      UNION ALL
      SELECT 'USERS' as table_name, COUNT(*) as record_count FROM users  
      UNION ALL
      SELECT 'USER_ROLES' as table_name, COUNT(*) as record_count FROM user_roles
      UNION ALL
      SELECT 'STUDENTS' as table_name, COUNT(*) as record_count FROM students
    `);
    
    counts.forEach(count => {
      console.log(`  📈 ${count.table_name}: ${count.record_count} records`);
    });

    // Display users with their roles
    console.log('\n👥 Users and their roles:');
    const [usersWithRoles] = await connection.query(`
      SELECT 
        u.id,
        u.loginID,
        u.userRole,
        u.status,
        GROUP_CONCAT(r.role_name SEPARATOR ', ') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      GROUP BY u.id, u.loginID, u.userRole, u.status
      ORDER BY u.id
    `);
    
    usersWithRoles.forEach(user => {
      console.log(`  👤 ${user.loginID} (${user.userRole}) -> ${user.roles || 'No roles'}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🔑 Sample Login Credentials (ALL USERS USE PASSWORD: test123):');
    console.log('  Admin: admin / test123');
    console.log('  Facility: facility_manager / test123');
    console.log('  Supervisor: supervisor_john / test123');
    console.log('  Trainer: trainer_mary / test123');
    console.log('  Student: student_demo / test123');
    console.log('  Test User: test_user / test123');
    console.log('  Inactive User: inactive_user / test123');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seeding
seedDatabase();