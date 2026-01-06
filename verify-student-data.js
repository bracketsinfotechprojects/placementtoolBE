const mysql = require('mysql2/promise');

async function verifyStudentData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'student_crm',
    });

    try {
        console.log('🔍 Verifying student data across all tables...\n');

        // Get the latest student ID
        const [students] = await connection.execute(
            'SELECT id, first_name, last_name, created_at FROM students ORDER BY id DESC LIMIT 1'
        );
        
        if (students.length === 0) {
            console.log('❌ No students found in database');
            return;
        }

        const studentId = students[0].id;
        console.log(`📋 Checking data for Student ID: ${studentId}`);
        console.log(`👤 Student: ${students[0].first_name} ${students[0].last_name}`);
        console.log(`📅 Created: ${students[0].created_at}\n`);

        // Check each table
        const tables = [
            'contact_details',
            'visa_details', 
            'addresses',
            'eligibility_status',
            'student_lifestyle',
            'placement_preferences',
            'facility_records',
            'address_change_requests',
            'job_status_updates'
        ];

        for (const table of tables) {
            try {
                const [results] = await connection.execute(
                    `SELECT COUNT(*) as count FROM ${table} WHERE student_id = ?`,
                    [studentId]
                );
                
                const count = results[0].count;
                if (count > 0) {
                    console.log(`✅ ${table}: ${count} record(s) found`);
                    
                    // Show a sample of the data
                    const [sample] = await connection.execute(
                        `SELECT * FROM ${table} WHERE student_id = ? LIMIT 1`,
                        [studentId]
                    );
                    
                    // Print key fields based on table
                    if (table === 'contact_details') {
                        console.log(`   📧 Email: ${sample[0].email}`);
                        console.log(`   📱 Mobile: ${sample[0].primary_mobile}\n`);
                    } else if (table === 'visa_details') {
                        console.log(`   🛂 Visa Type: ${sample[0].visa_type}`);
                        console.log(`   📄 Visa Number: ${sample[0].visa_number}\n`);
                    } else if (table === 'addresses') {
                        console.log(`   🏠 Address: ${sample[0].line1}, ${sample[0].city}\n`);
                    } else if (table === 'eligibility_status') {
                        console.log(`   ✅ Classes Completed: ${sample[0].classes_completed}`);
                        console.log(`   ✅ Fees Paid: ${sample[0].fees_paid}\n`);
                    } else if (table === 'student_lifestyle') {
                        console.log(`   🚗 Has License: ${sample[0].driving_license}`);
                        console.log(`   🚌 Public Transport: ${sample[0].public_transport_only}\n`);
                    } else if (table === 'placement_preferences') {
                        console.log(`   🌟 Preferred States: ${sample[0].preferred_states}`);
                        console.log(`   🏢 Full Time Only: ${sample[0].full_time}\n`);
                    } else if (table === 'facility_records') {
                        console.log(`   🏢 Facility: ${sample[0].facility_name}`);
                        console.log(`   📍 Course: ${sample[0].course_type}\n`);
                    } else if (table === 'address_change_requests') {
                        console.log(`   📍 Change Reason: ${sample[0].change_reason}\n`);
                    } else if (table === 'job_status_updates') {
                        console.log(`   💼 Status: ${sample[0].status}`);
                        console.log(`   🏢 Employer: ${sample[0].employer_name || 'N/A'}\n`);
                    }
                } else {
                    console.log(`❌ ${table}: No records found`);
                }
            } catch (error) {
                console.log(`❌ ${table}: Error - ${error.message}`);
            }
        }

        console.log('🎉 Data verification completed!');

    } catch (error) {
        console.error('❌ Error verifying student data:', error.message);
    } finally {
        await connection.end();
    }
}

verifyStudentData();