#!/usr/bin/env node

/**
 * SQL Procedure Testing Script
 * Tests the CreateStudentWithUserAccount stored procedure functionality
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_crm',
    port: process.env.DB_PORT || 3306
};

// Test data
const TEST_STUDENTS = [
    {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice.johnson@university.edu',
        dob: '1995-03-15',
        gender: 'Female',
        nationality: 'Canadian',
        student_type: 'Graduate',
        status: 'active',
        primary_mobile: '+1-416-555-0123'
    },
    {
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob.smith@student.edu',
        dob: '1996-08-22',
        gender: 'Male',
        nationality: 'American',
        student_type: 'Undergraduate',
        status: 'active',
        primary_mobile: '+1-647-555-0456'
    },
    {
        first_name: 'Carol',
        last_name: 'Davis',
        email: 'carol.davis@grad.university.edu',
        dob: '1994-12-10',
        gender: 'Female',
        nationality: 'British',
        student_type: 'Graduate',
        status: 'active',
        primary_mobile: '+44-20-555-0789'
    }
];

class SQLProcedureTester {
    constructor() {
        this.connection = null;
        this.testResults = [];
    }

    async initialize() {
        try {
            this.connection = await mysql.createConnection(TEST_CONFIG);
            console.log('✅ Database connection established');
            await this.loadProcedure();
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async loadProcedure() {
        try {
            const fs = require('fs');
            const path = require('path');
            
            const procedureSQL = fs.readFileSync(
                path.join(__dirname, 'create-student-user-procedure.sql'), 
                'utf8'
            );

            // Split and execute each statement
            const statements = procedureSQL
                .split('$$')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            for (const statement of statements) {
                if (statement.includes('CREATE PROCEDURE') || statement.includes('DELIMITER')) {
                    await this.connection.query(statement);
                }
            }

            console.log('✅ SQL procedures loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load procedures:', error.message);
            throw error;
        }
    }

    async testSingleStudentCreation() {
        console.log('\n🧪 Testing Single Student Creation...');
        
        const testStudent = TEST_STUDENTS[0];
        
        try {
            const [results] = await this.connection.query(
                'CALL CreateStudentWithUserAccount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    testStudent.first_name,
                    testStudent.last_name,
                    testStudent.email,
                    testStudent.dob,
                    testStudent.gender,
                    testStudent.nationality,
                    testStudent.student_type,
                    testStudent.status,
                    testStudent.primary_mobile
                ]
            );

            const studentInfo = results[0][0];
            console.log('✅ Student created successfully:', studentInfo);
            
            // Verify student record
            const [studentRows] = await this.connection.query(
                'SELECT * FROM students WHERE student_id = ?',
                [studentInfo.student_id]
            );

            if (studentRows.length > 0) {
                console.log('✅ Student record verified:', studentRows[0]);
                this.testResults.push({ test: 'Single Student Creation', status: 'PASS' });
            } else {
                throw new Error('Student record not found');
            }

            // Verify user record
            const [userRows] = await this.connection.query(
                'SELECT * FROM users WHERE id = ?',
                [studentInfo.user_id]
            );

            if (userRows.length > 0) {
                console.log('✅ User record verified:', {
                    id: userRows[0].id,
                    loginID: userRows[0].loginID,
                    userRole: userRows[0].userRole,
                    status: userRows[0].status
                });
            } else {
                throw new Error('User record not found');
            }

            // Verify role assignment
            const [roleRows] = await this.connection.query(
                'SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = ?',
                [studentInfo.user_id]
            );

            if (roleRows.some(row => row.role_name === 'Student')) {
                console.log('✅ Role assignment verified');
            } else {
                throw new Error('Role assignment not found');
            }

            return studentInfo.student_id;

        } catch (error) {
            console.error('❌ Single student creation failed:', error.message);
            this.testResults.push({ test: 'Single Student Creation', status: 'FAIL', error: error.message });
            throw error;
        }
    }

    async testBulkCreation() {
        console.log('\n🧪 Testing Bulk Student Creation...');
        
        try {
            const createdStudents = [];
            
            for (let i = 1; i < TEST_STUDENTS.length; i++) {
                const studentData = TEST_STUDENTS[i];
                const jsonData = JSON.stringify(studentData);
                
                const [results] = await this.connection.query(
                    'CALL CreateStudentUserBulk(?)',
                    [jsonData]
                );

                const studentInfo = results[0][0];
                createdStudents.push(studentInfo.student_id);
                console.log(`✅ Bulk student ${i} created:`, studentInfo);
            }

            // Verify all created students
            for (const studentId of createdStudents) {
                const [studentRows] = await this.connection.query(
                    'SELECT COUNT(*) as count FROM students WHERE student_id = ?',
                    [studentId]
                );

                if (studentRows[0].count === 0) {
                    throw new Error(`Student ${studentId} not found after bulk creation`);
                }
            }

            console.log('✅ All bulk students verified');
            this.testResults.push({ test: 'Bulk Student Creation', status: 'PASS' });
            return createdStudents;

        } catch (error) {
            console.error('❌ Bulk student creation failed:', error.message);
            this.testResults.push({ test: 'Bulk Student Creation', status: 'FAIL', error: error.message });
            throw error;
        }
    }

    async testSyncExistingStudents() {
        console.log('\n🧪 Testing Sync of Existing Students...');
        
        try {
            // First create a student without user account (manual entry)
            const [studentResult] = await this.connection.query(
                `INSERT INTO students (first_name, last_name, dob, gender, nationality, student_type, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                ['Manual', 'Student', '1997-01-01', 'Male', 'Canadian', 'Undergraduate', 'active']
            );

            const manualStudentId = studentResult.insertId;

            // Add contact details without creating user
            await this.connection.query(
                `INSERT INTO contact_details (student_id, email, is_primary, created_at, updated_at)
                 VALUES (?, ?, 1, NOW(), NOW())`,
                [manualStudentId, 'manual.student@test.edu']
            );

            console.log(`✅ Manual student created: ${manualStudentId}`);

            // Run sync procedure
            const [syncResults] = await this.connection.query('CALL SyncExistingStudentsWithUsers()');
            console.log('✅ Sync procedure executed:', syncResults[0]);

            // Verify sync worked
            const [userRows] = await this.connection.query(
                'SELECT * FROM users WHERE loginID = ?',
                ['manual.student@test.edu']
            );

            if (userRows.length > 0) {
                console.log('✅ Manual student synced with user account:', userRows[0]);
                this.testResults.push({ test: 'Sync Existing Students', status: 'PASS' });
                
                // Cleanup
                await this.connection.query('DELETE FROM user_roles WHERE user_id = ?', [userRows[0].id]);
                await this.connection.query('DELETE FROM users WHERE id = ?', [userRows[0].id]);
                await this.connection.query('DELETE FROM contact_details WHERE student_id = ?', [manualStudentId]);
                await this.connection.query('DELETE FROM students WHERE student_id = ?', [manualStudentId]);
                
            } else {
                throw new Error('Sync did not create user account');
            }

        } catch (error) {
            console.error('❌ Sync test failed:', error.message);
            this.testResults.push({ test: 'Sync Existing Students', status: 'FAIL', error: error.message });
            throw error;
        }
    }

    async testErrorHandling() {
        console.log('\n🧪 Testing Error Handling...');
        
        try {
            // Test duplicate email
            try {
                await this.connection.query(
                    'CALL CreateStudentWithUserAccount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        'Duplicate', 'Test', TEST_STUDENTS[0].email, '1995-01-01',
                        'Male', 'Canadian', 'Undergraduate', 'active', '+1234567890'
                    ]
                );
                throw new Error('Expected duplicate email error but none occurred');
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log('✅ Duplicate email error handling verified');
                } else {
                    throw error;
                }
            }

            // Test invalid data
            try {
                await this.connection.query(
                    'CALL CreateStudentWithUserAccount(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        'Invalid', 'Test', '', '1995-01-01', // Empty email
                        'Male', 'Canadian', 'Undergraduate', 'active', '+1234567890'
                    ]
                );
                throw new Error('Expected validation error but none occurred');
            } catch (error) {
                if (error.message.includes('required') || error.message.includes('Email')) {
                    console.log('✅ Validation error handling verified');
                } else {
                    throw error;
                }
            }

            this.testResults.push({ test: 'Error Handling', status: 'PASS' });

        } catch (error) {
            console.error('❌ Error handling test failed:', error.message);
            this.testResults.push({ test: 'Error Handling', status: 'FAIL', error: error.message });
            throw error;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting SQL Procedure Tests...\n');
        
        try {
            await this.initialize();
            
            const studentIds = [];
            
            // Test single student creation
            const studentId = await this.testSingleStudentCreation();
            studentIds.push(studentId);
            
            // Test bulk creation
            const bulkIds = await this.testBulkCreation();
            studentIds.push(...bulkIds);
            
            // Test sync functionality
            await this.testSyncExistingStudents();
            
            // Test error handling
            await this.testErrorHandling();
            
            // Generate summary
            this.generateTestSummary();
            
            // Cleanup test data
            await this.cleanupTestData(studentIds);
            
        } catch (error) {
            console.error('\n❌ Test suite failed:', error.message);
            this.generateTestSummary();
        } finally {
            if (this.connection) {
                await this.connection.end();
                console.log('\n🔒 Database connection closed');
            }
        }
    }

    async cleanupTestData(studentIds) {
        console.log('\n🧹 Cleaning up test data...');
        
        try {
            for (const studentId of studentIds) {
                // Delete user and roles first (foreign key constraints)
                const [userRows] = await this.connection.query(
                    'SELECT id FROM users WHERE loginID IN (SELECT email FROM contact_details WHERE student_id = ? AND is_primary = 1)',
                    [studentId]
                );

                for (const userRow of userRows) {
                    await this.connection.query('DELETE FROM user_roles WHERE user_id = ?', [userRow.id]);
                    await this.connection.query('DELETE FROM users WHERE id = ?', [userRow.id]);
                }

                // Delete student and contact data
                await this.connection.query('DELETE FROM contact_details WHERE student_id = ?', [studentId]);
                await this.connection.query('DELETE FROM students WHERE student_id = ?', [studentId]);
            }
            
            console.log('✅ Test data cleanup completed');
            
        } catch (error) {
            console.error('⚠️  Cleanup failed:', error.message);
        }
    }

    generateTestSummary() {
        console.log('\n📊 Test Summary:');
        console.log('='.repeat(50));
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.status}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        console.log('='.repeat(50));
        console.log(`Total: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`);
        
        if (failed === 0) {
            console.log('🎉 All tests passed! SQL procedures are working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please check the errors above.');
        }
    }
}

// Main execution
if (require.main === module) {
    const tester = new SQLProcedureTester();
    tester.runAllTests().catch(console.error);
}

module.exports = SQLProcedureTester;