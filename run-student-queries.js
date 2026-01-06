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

async function executeQuery(query, description) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log(`\n=== ${description} ===`);
        
        const [rows] = await connection.execute(query);
        
        if (rows.length === 0) {
            console.log('No records found.');
        } else {
            console.log(`Found ${rows.length} records:`);
            console.log(JSON.stringify(rows, null, 2));
        }
        
    } catch (error) {
        console.error(`Error executing query:`, error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function runAllQueries() {
    console.log('🚀 Running Student Data SQL Queries...');
    console.log('Database:', dbConfig.database);
    console.log('Host:', dbConfig.host);
    
    try {
        // 1. Basic student info
        await executeQuery(
            `SELECT student_id, first_name, last_name, dob, gender, nationality, student_type, status, createdAt 
             FROM students WHERE isDeleted = 0 ORDER BY student_id DESC`,
            'Basic Student Information'
        );

        // 2. Students with contact details
        await executeQuery(
            `SELECT s.student_id, s.first_name, s.last_name, cd.primary_mobile, cd.email, cd.emergency_contact
             FROM students s 
             LEFT JOIN contact_details cd ON s.student_id = cd.student_id 
             WHERE s.isDeleted = 0 
             ORDER BY s.student_id DESC`,
            'Students with Contact Details'
        );

        // 3. Students with visa details
        await executeQuery(
            `SELECT s.student_id, s.first_name, s.last_name, vd.visa_type, vd.visa_number, vd.start_date, vd.expiry_date
             FROM students s 
             LEFT JOIN visa_details vd ON s.student_id = vd.student_id 
             WHERE s.isDeleted = 0 
             ORDER BY s.student_id DESC`,
            'Students with Visa Details'
        );

        // 4. Complete student data (comprehensive query)
        const completeQuery = `
            SELECT 
                s.student_id,
                s.first_name,
                s.last_name,
                s.dob,
                s.gender,
                s.nationality,
                s.student_type,
                s.status,
                cd.primary_mobile,
                cd.email,
                cd.emergency_contact,
                vd.visa_type,
                vd.visa_number,
                vd.start_date as visa_start_date,
                vd.expiry_date as visa_expiry_date,
                a.line1,
                a.city,
                a.state,
                a.country,
                a.postal_code,
                es.classes_completed,
                es.fees_paid,
                es.assignments_submitted,
                es.documents_submitted,
                es.trainer_consent,
                sl.currently_working,
                sl.driving_license,
                sl.own_vehicle,
                sl.preferred_days,
                sl.preferred_time_slots,
                pp.preferred_states,
                pp.preferred_cities,
                pp.max_travel_distance_km,
                fr.facility_name,
                fr.course_type,
                jsu.status as job_status,
                jsu.employer_name
            FROM students s
            LEFT JOIN contact_details cd ON s.student_id = cd.student_id
            LEFT JOIN visa_details vd ON s.student_id = vd.student_id
            LEFT JOIN addresses a ON s.student_id = a.student_id AND a.is_primary = 1
            LEFT JOIN eligibility_status es ON s.student_id = es.student_id
            LEFT JOIN student_lifestyle sl ON s.student_id = sl.student_id
            LEFT JOIN placement_preferences pp ON s.student_id = pp.student_id
            LEFT JOIN facility_records fr ON s.student_id = fr.student_id
            LEFT JOIN job_status_updates jsu ON s.student_id = jsu.student_id
            WHERE s.isDeleted = 0
            ORDER BY s.student_id DESC
        `;
        
        await executeQuery(completeQuery, 'Complete Student Records');

        // 5. Student statistics
        await executeQuery(
            `SELECT 
                COUNT(*) as total_students,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_students,
                SUM(CASE WHEN student_type = 'international' THEN 1 ELSE 0 END) as international_students
             FROM students WHERE isDeleted = 0`,
            'Student Statistics'
        );

        console.log('\n✅ All queries completed successfully!');
        
    } catch (error) {
        console.error('❌ Error running queries:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    runAllQueries();
}

module.exports = { executeQuery, runAllQueries };