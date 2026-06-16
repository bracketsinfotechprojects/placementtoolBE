import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCareerJobsTables1749200000000 implements MigrationInterface {
  name = 'CreateCareerJobsTables1749200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating career_jobs table...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`career_jobs\` (
        \`job_id\` int NOT NULL AUTO_INCREMENT,
        \`designation\` varchar(255) NOT NULL COMMENT 'Job title / designation',
        \`company\` varchar(255) NOT NULL COMMENT 'Company name',
        \`location\` varchar(255) NOT NULL COMMENT 'Job location',
        \`salary\` varchar(100) NULL COMMENT 'Salary range or amount',
        \`job_type\` enum('full_time','part_time','contract','internship') NULL COMMENT 'Type of employment',
        \`experience_required\` varchar(100) NULL COMMENT 'Experience requirement',
        \`description\` text NULL COMMENT 'Job description',
        \`requirements\` text NULL COMMENT 'Job requirements',
        \`application_deadline\` date NULL COMMENT 'Last date to apply',
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether the job is active',
        \`created_by\` int NOT NULL COMMENT 'User who created the job',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`job_id\`),
        INDEX \`IDX_career_jobs_is_active\` (\`is_active\`),
        INDEX \`IDX_career_jobs_created_by\` (\`created_by\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ career_jobs table created');

    console.log('🚀 Creating career_job_student_mapping table...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`career_job_student_mapping\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`job_id\` int NOT NULL COMMENT 'Reference to career_jobs table',
        \`student_id\` int NOT NULL COMMENT 'Reference to students table',
        \`assigned_by\` int NOT NULL COMMENT 'User who made the assignment',
        \`assigned_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date of assignment',
        \`status\` varchar(20) NOT NULL DEFAULT 'active' COMMENT 'active or inactive',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_career_job_student\` (\`job_id\`, \`student_id\`),
        INDEX \`IDX_career_job_student_mapping_job_id\` (\`job_id\`),
        INDEX \`IDX_career_job_student_mapping_student_id\` (\`student_id\`),
        CONSTRAINT \`fk_cjsm_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`career_jobs\`(\`job_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_cjsm_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ career_job_student_mapping table created');

    console.log('🚀 Creating career_job_interest table...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`career_job_interest\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`job_id\` int NOT NULL COMMENT 'Reference to career_jobs table',
        \`student_id\` int NOT NULL COMMENT 'Reference to students table',
        \`interest_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the student marked interest',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_career_job_interest\` (\`job_id\`, \`student_id\`),
        INDEX \`IDX_career_job_interest_job_id\` (\`job_id\`),
        INDEX \`IDX_career_job_interest_student_id\` (\`student_id\`),
        CONSTRAINT \`fk_cji_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`career_jobs\`(\`job_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_cji_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ career_job_interest table created');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `career_job_interest`');
    await queryRunner.query('DROP TABLE IF EXISTS `career_job_student_mapping`');
    await queryRunner.query('DROP TABLE IF EXISTS `career_jobs`');
    console.log('✅ Career jobs tables dropped');
  }
}
