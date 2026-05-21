import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComplaintTables1747500000000 implements MigrationInterface {
  name = 'CreateComplaintTables1747500000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating Complaint System tables...');

    // ==============================================
    // STUDENT COMPLAINTS TABLE
    // ==============================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`student_complaints\` (
        \`complaint_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL COMMENT 'Foreign key to students table',
        \`facility_id\` int NULL COMMENT 'Foreign key to facilities table (which facility the complaint is about)',
        
        -- Complaint Details
        \`category\` varchar(100) NOT NULL COMMENT 'Category of complaint (e.g., Facility Issues, Academic, Conduct, Health, Other)',
        \`priority\` varchar(20) NOT NULL COMMENT 'Priority level (e.g., Low, Medium, High)',
        \`description\` text NOT NULL COMMENT 'Detailed description of the complaint',
        \`location\` varchar(255) NOT NULL COMMENT 'Location where the issue occurred (e.g., Building A, Room 203)',
        \`attachments\` json NULL COMMENT 'Array of file paths for attachments',
        \`urgency_level\` varchar(20) NOT NULL COMMENT 'Urgency level (e.g., Low, Medium, High)',
        \`is_anonymous\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether the complaint is reported anonymously',
        
        -- Status & Resolution
        \`status\` varchar(50) NOT NULL DEFAULT 'Pending' COMMENT 'Status of complaint (e.g., Pending, In Progress, Resolved, Closed, Rejected)',
        \`resolution_notes\` text NULL COMMENT 'Notes on resolution by admin/supervisor',
        \`resolved_at\` datetime NULL COMMENT 'Timestamp when complaint was resolved',
        
        -- Audit Trail
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updatedAt\` timestamp NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
        \`isDeleted\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        
        PRIMARY KEY (\`complaint_id\`),
        INDEX \`IDX_student_complaint_id\` (\`complaint_id\`),
        INDEX \`IDX_student_complaint_student_id\` (\`student_id\`),
        INDEX \`IDX_student_complaint_facility_id\` (\`facility_id\`),
        INDEX \`IDX_student_complaint_status\` (\`status\`),
        INDEX \`IDX_student_complaint_priority\` (\`priority\`),
        INDEX \`IDX_student_complaint_createdAt\` (\`createdAt\`),
        INDEX \`IDX_student_complaint_is_deleted\` (\`isDeleted\`),
        
        CONSTRAINT \`fk_student_complaint_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_student_complaint_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ==============================================
    // FACILITY SUPERVISOR COMPLAINTS TABLE
    // ==============================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_supervisor_complaints\` (
        \`complaint_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` int NOT NULL COMMENT 'Foreign key to facilities table',
        \`supervisor_id\` int NOT NULL COMMENT 'Foreign key to facility supervisors table',
        \`student_id\` int NOT NULL COMMENT 'Foreign key to students table (student being complained against)',
        
        -- Complaint Details
        \`student_name\` varchar(200) NOT NULL COMMENT 'Name of the student being complained against',
        \`complaint_type\` varchar(100) NOT NULL COMMENT 'Type of complaint (e.g., Misconduct, Attendance, Academic, Behavior, Other)',
        \`urgency_level\` varchar(20) NOT NULL COMMENT 'Urgency level (e.g., Low, Medium, High)',
        \`location\` varchar(255) NOT NULL COMMENT 'Location where the incident occurred (e.g., Building A, Room 203)',
        \`description\` text NOT NULL COMMENT 'Detailed description of the complaint',
        \`attachments\` json NULL COMMENT 'Array of file paths for attachments',
        \`is_anonymous\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether the complaint is reported anonymously',
        
        -- Status & Resolution
        \`status\` varchar(50) NOT NULL DEFAULT 'Pending' COMMENT 'Status of complaint (e.g., Pending, In Progress, Resolved, Closed, Rejected)',
        \`resolution_notes\` text NULL COMMENT 'Notes on resolution by admin/supervisor',
        \`resolved_at\` datetime NULL COMMENT 'Timestamp when complaint was resolved',
        
        -- Audit Trail
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updatedAt\` timestamp NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
        \`isDeleted\` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
        
        PRIMARY KEY (\`complaint_id\`),
        INDEX \`IDX_facility_supervisor_complaint_id\` (\`complaint_id\`),
        INDEX \`IDX_facility_supervisor_complaint_facility_id\` (\`facility_id\`),
        INDEX \`IDX_facility_supervisor_complaint_supervisor_id\` (\`supervisor_id\`),
        INDEX \`IDX_facility_supervisor_complaint_student_id\` (\`student_id\`),
        INDEX \`IDX_facility_supervisor_complaint_status\` (\`status\`),
        INDEX \`IDX_facility_supervisor_complaint_urgency_level\` (\`urgency_level\`),
        INDEX \`IDX_facility_supervisor_complaint_createdAt\` (\`createdAt\`),
        INDEX \`IDX_facility_supervisor_complaint_is_deleted\` (\`isDeleted\`),
        
        CONSTRAINT \`fk_facility_supervisor_complaint_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_facility_supervisor_complaint_supervisor\` FOREIGN KEY (\`supervisor_id\`) REFERENCES \`FacilitySupervisor\`(\`supervisor_id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_facility_supervisor_complaint_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Complaint System tables created successfully!');
    console.log('📋 Tables created: student_complaints, facility_supervisor_complaints');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping Complaint System tables...');
    
    await queryRunner.query('DROP TABLE IF EXISTS \`facility_supervisor_complaints\`');
    await queryRunner.query('DROP TABLE IF EXISTS \`student_complaints\`');
    
    console.log('✅ Complaint System tables dropped successfully');
  }
}
