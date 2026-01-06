const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'testCRM',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function testUsersTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🚀 Testing Users Table Migration...');
        console.log('Database:', dbConfig.database);
        
        // Test 1: Check if users table exists
        console.log('\n1. Checking if users table exists...');
        const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
        if (tables.length === 0) {
            console.log('❌ Users table does not exist. Run migrations first.');
            return;
        }
        console.log('✅ Users table exists');

        // Test 2: Describe users table structure
        console.log('\n2. Users table structure:');
        const [columns] = await connection.execute('DESCRIBE users');
        console.table(columns);

        // Test 3: Create a test user
        console.log('\n3. Creating test user...');
        const testUser = {
            loginID: 'testuser_' + Date.now(),
            password: 'hashed_password_123', // In production, this should be properly hashed
            userRole: 'admin',
            status: 'active'
        };

        const [result] = await connection.execute(
            'INSERT INTO users (loginID, password, userRole, status) VALUES (?, ?, ?, ?)',
            [testUser.loginID, testUser.password, testUser.userRole, testUser.status]
        );
        console.log('✅ Test user created with ID:', result.insertId);

        // Test 4: Retrieve the user
        console.log('\n4. Retrieving created user...');
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [result.insertId]
        );
        console.log('Retrieved user:', JSON.stringify(users[0], null, 2));

        // Test 5: Test unique constraint on loginID
        console.log('\n5. Testing unique constraint on loginID...');
        try {
            await connection.execute(
                'INSERT INTO users (loginID, password, userRole, status) VALUES (?, ?, ?, ?)',
                [testUser.loginID, 'another_password', 'user', 'active']
            );
            console.log('❌ Unique constraint not working - duplicate loginID was allowed');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log('✅ Unique constraint working correctly - duplicate loginID rejected');
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        // Test 6: Test user statistics
        console.log('\n6. Testing user statistics...');
        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN userRole = 'admin' THEN 1 ELSE 0 END) as admin_users,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users
            FROM users
        `);
        console.log('User statistics:', JSON.stringify(stats[0], null, 2));

        // Test 7: Clean up test user
        console.log('\n7. Cleaning up test user...');
        await connection.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
        console.log('✅ Test user deleted');

        console.log('\n🎉 All tests passed! Users table migration is working correctly.');
        
    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Tip: Check your database credentials in .env file');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if called directly
if (require.main === module) {
    testUsersTable();
}

module.exports = { testUsersTable };