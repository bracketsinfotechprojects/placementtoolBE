import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendanceLoggingTables1747000000000 implements MigrationInterface {
  name = 'CreateAttendanceLoggingTables1747000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating Attendance Logging System tables...');

    // ==============================================
    // ATTENDANCE LOGS TABLE (Core attendance records)
    // ==============================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`attendance_logs\` (
        \`attendance_log_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL COMMENT 'Foreign key to students table',
        \`facility_id\` int NOT NULL COMMENT 'Foreign key to facility table',
        \`placement_slot_id\` int NOT NULL COMMENT 'Foreign key to placement_slots table',
        \`branch_id\` int NULL COMMENT 'Foreign key to facility_branch_site table (specific branch where student is placed)',
        
        -- Attendance Details
        \`attendance_date\` date NOT NULL COMMENT 'Date of attendance',
        \`status\` enum('present', 'absent', 'leave', 'half_day', 'late', 'early_departure') NOT NULL DEFAULT 'present' COMMENT 'Attendance status',
        \`login_time\` time NULL COMMENT 'Time when student logged in/arrived',
        \`logout_time\` time NULL COMMENT 'Time when student logged out/left',
        \`break_duration_minutes\` int NULL DEFAULT 0 COMMENT 'Break duration in minutes',
        \`worked_hours\` decimal(5,2) NULL COMMENT 'Total hours worked (calculated)',
        
        -- Leave & Absence Details
        \`leave_type\` enum('sick', 'casual', 'emergency', 'other') NULL COMMENT 'Type of leave if status is leave',
        \`leave_reason\` text NULL COMMENT 'Reason for leave or absence',
        \`is_approved_leave\` tinyint(1) NULL DEFAULT 0 COMMENT 'Whether leave was pre-approved',
        
        -- Work Details
        \`task_description\` text NULL COMMENT 'Tasks completed during the day',
        \`supervisor_notes\` text NULL COMMENT 'Notes from facility supervisor',
        \`student_notes\` text NULL COMMENT 'Notes from student',
        
        -- Compliance & Flags
        \`meets_attendance_policy\` tinyint(1) NULL DEFAULT 1 COMMENT 'Whether attendance meets facility policy',
        \`policy_violation_reason\` text NULL COMMENT 'Reason if attendance policy violated',
        \`requires_follow_up\` tinyint(1) NULL DEFAULT 0 COMMENT 'Flag for follow-up action needed',
        
        -- Audit Trail
        \`logged_by_user_id\` int NOT NULL COMMENT 'Foreign key to users table - who logged this attendance',
        \`logged_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When this record was created',
        \`updated_by_user_id\` int NULL COMMENT 'Foreign key to users table - who last updated',
        \`updated_at\` timestamp NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'When this record was last updated',
        \`is_deleted\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        
        PRIMARY KEY (\`attendance_log_id\`),
        INDEX \`IDX_attendance_student_id\` (\`student_id\`),
        INDEX \`IDX_attendance_facility_id\` (\`facility_id\`),
        INDEX \`IDX_attendance_placement_slot_id\` (\`placement_slot_id\`),
        INDEX \`IDX_attendance_date\` (\`attendance_date\`),
        INDEX \`IDX_attendance_status\` (\`status\`),
        INDEX \`IDX_attendance_student_date\` (\`student_id\`, \`attendance_date\`),
        INDEX \`IDX_attendance_facility_date\` (\`facility_id\`, \`attendance_date\`),
        INDEX \`IDX_attendance_is_deleted\` (\`is_deleted\`),
        
        CONSTRAINT \`fk_attendance_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_attendance_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_attendance_placement_slot\` FOREIGN KEY (\`placement_slot_id\`) REFERENCES \`placement_slots\`(\`placementslot_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_attendance_branch\` FOREIGN KEY (\`branch_id\`) REFERENCES \`facility_branch_site\`(\`branch_id\`) ON DELETE SET NULL,
        CONSTRAINT \`fk_attendance_logged_by\` FOREIGN KEY (\`logged_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_attendance_updated_by\` FOREIGN KEY (\`updated_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ==============================================
    // ATTENDANCE SUMMARY TABLE (For logbook generation)
    // ==============================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`attendance_summary\` (
        \`summary_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL COMMENT 'Foreign key to students table',
        \`facility_id\` int NOT NULL COMMENT 'Foreign key to facility table',
        \`placement_slot_id\` int NOT NULL COMMENT 'Foreign key to placement_slots table',
        
        -- Period Details
        \`summary_period\` enum('daily', 'weekly', 'monthly') NOT NULL DEFAULT 'weekly' COMMENT 'Period type for summary',
        \`period_start_date\` date NOT NULL COMMENT 'Start date of the period',
        \`period_end_date\` date NOT NULL COMMENT 'End date of the period',
        
        -- Attendance Metrics
        \`total_days_in_period\` int NOT NULL COMMENT 'Total working days in period',
        \`days_present\` int NOT NULL DEFAULT 0 COMMENT 'Number of days present',
        \`days_absent\` int NOT NULL DEFAULT 0 COMMENT 'Number of days absent',
        \`days_on_leave\` int NOT NULL DEFAULT 0 COMMENT 'Number of days on leave',
        \`half_days\` int NOT NULL DEFAULT 0 COMMENT 'Number of half days',
        \`late_arrivals\` int NOT NULL DEFAULT 0 COMMENT 'Number of late arrivals',
        \`early_departures\` int NOT NULL DEFAULT 0 COMMENT 'Number of early departures',
        
        -- Hours Metrics
        \`total_hours_worked\` decimal(8,2) NOT NULL DEFAULT 0 COMMENT 'Total hours worked in period',
        \`total_hours_required\` decimal(8,2) NOT NULL COMMENT 'Total hours required for period',
        \`hours_shortfall\` decimal(8,2) NULL COMMENT 'Hours shortfall if any',
        \`average_daily_hours\` decimal(5,2) NULL COMMENT 'Average hours per day',
        
        -- Compliance
        \`attendance_percentage\` decimal(5,2) NOT NULL COMMENT 'Attendance percentage (0-100)',
        \`meets_minimum_attendance\` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether meets minimum attendance requirement',
        \`policy_violations\` int NOT NULL DEFAULT 0 COMMENT 'Number of policy violations',
        
        -- Status
        \`status\` enum('draft', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft' COMMENT 'Summary status',
        \`approved_by_user_id\` int NULL COMMENT 'Foreign key to users table - who approved',
        \`approval_notes\` text NULL COMMENT 'Notes on approval/rejection',
        
        -- Audit Trail
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updated_at\` timestamp NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
        \`is_deleted\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        
        PRIMARY KEY (\`summary_id\`),
        INDEX \`IDX_summary_student_id\` (\`student_id\`),
        INDEX \`IDX_summary_facility_id\` (\`facility_id\`),
        INDEX \`IDX_summary_placement_slot_id\` (\`placement_slot_id\`),
        INDEX \`IDX_summary_period\` (\`period_start_date\`, \`period_end_date\`),
        INDEX \`IDX_summary_student_period\` (\`student_id\`, \`period_start_date\`, \`period_end_date\`),
        INDEX \`IDX_summary_status\` (\`status\`),
        INDEX \`IDX_summary_is_deleted\` (\`is_deleted\`),
        
        CONSTRAINT \`fk_summary_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_summary_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_summary_placement_slot\` FOREIGN KEY (\`placement_slot_id\`) REFERENCES \`placement_slots\`(\`placementslot_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_summary_approved_by\` FOREIGN KEY (\`approved_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ==============================================
    // ATTENDANCE DEVIATIONS TABLE (Track anomalies)
    // ==============================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`attendance_deviations\` (
        \`deviation_id\` int NOT NULL AUTO_INCREMENT,
        \`attendance_log_id\` int NOT NULL COMMENT 'Foreign key to attendance_logs table',
        \`student_id\` int NOT NULL COMMENT 'Foreign key to students table',
        \`facility_id\` int NOT NULL COMMENT 'Foreign key to facility table',
        
        -- Deviation Details
        \`deviation_type\` enum('absence', 'late_arrival', 'early_departure', 'insufficient_hours', 'policy_violation', 'other') NOT NULL COMMENT 'Type of deviation',
        \`severity\` enum('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium' COMMENT 'Severity level',
        \`description\` text NOT NULL COMMENT 'Description of deviation',
        \`impact_on_hours\` decimal(5,2) NULL COMMENT 'Impact on total hours worked',
        
        -- Resolution
        \`status\` enum('flagged', 'acknowledged', 'resolved', 'escalated') NOT NULL DEFAULT 'flagged' COMMENT 'Resolution status',
        \`resolution_notes\` text NULL COMMENT 'Notes on resolution',
        \`resolved_by_user_id\` int NULL COMMENT 'Foreign key to users table - who resolved',
        \`resolved_at\` timestamp NULL COMMENT 'When deviation was resolved',
        
        -- Audit Trail
        \`flagged_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When deviation was flagged',
        \`flagged_by_user_id\` int NOT NULL COMMENT 'Foreign key to users table - who flagged',
        \`is_deleted\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        
        PRIMARY KEY (\`deviation_id\`),
        INDEX \`IDX_deviation_attendance_log_id\` (\`attendance_log_id\`),
        INDEX \`IDX_deviation_student_id\` (\`student_id\`),
        INDEX \`IDX_deviation_facility_id\` (\`facility_id\`),
        INDEX \`IDX_deviation_type\` (\`deviation_type\`),
        INDEX \`IDX_deviation_severity\` (\`severity\`),
        INDEX \`IDX_deviation_status\` (\`status\`),
        INDEX \`IDX_deviation_is_deleted\` (\`is_deleted\`),
        
        CONSTRAINT \`fk_deviation_attendance_log\` FOREIGN KEY (\`attendance_log_id\`) REFERENCES \`attendance_logs\`(\`attendance_log_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_deviation_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_deviation_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_deviation_flagged_by\` FOREIGN KEY (\`flagged_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT,
        CONSTRAINT \`fk_deviation_resolved_by\` FOREIGN KEY (\`resolved_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Attendance Logging System tables created successfully!');
    console.log('📊 Tables created: attendance_logs, attendance_summary, attendance_deviations');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping Attendance Logging System tables...');
    
    await queryRunner.query('DROP TABLE IF EXISTS \`attendance_deviations\`');
    await queryRunner.query('DROP TABLE IF EXISTS \`attendance_summary\`');
    await queryRunner.query('DROP TABLE IF EXISTS \`attendance_logs\`');
    
    console.log('✅ Attendance Logging System tables dropped successfully');
  }
}
