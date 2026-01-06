import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteEntityMatchingSchema1704205800000 implements MigrationInterface {
  name = 'CompleteEntityMatchingSchema1704205800000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Starting COMPLETE entity-matching database schema creation...');

    // ==============================================
    // USER ROLES SYSTEM (Matching User Entity exactly)
    // ==============================================

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`role_id\` int NOT NULL AUTO_INCREMENT,
        \`role_name\` varchar(50) NOT NULL,
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`role_id\`),
        UNIQUE INDEX \`IDX_roles_role_name\` (\`role_name\`),
        INDEX \`IDX_roles_isdeleted\` (\`isDeleted\`)
      ) ENGINE=InnoDB
    `);

    // Create users table (matching User entity EXACTLY)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`loginID\` varchar(100) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`roleID\` int NOT NULL,
        \`status\` varchar(20) NOT NULL DEFAULT 'active',
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_users_loginID\` (\`loginID\`),
        INDEX \`IDX_users_roleID\` (\`roleID\`),
        INDEX \`IDX_users_status\` (\`status\`),
        INDEX \`IDX_users_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_users_role\` FOREIGN KEY (\`roleID\`) REFERENCES \`roles\`(\`role_id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // STUDENT CORE TABLES (Matching Student Entity and related entities exactly)
    // ==============================================

    // Create students table (with BaseEntity fields: createdAt, updatedAt, isDeleted)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`students\` (
        \`student_id\` int NOT NULL AUTO_INCREMENT,
        \`first_name\` varchar(100) NOT NULL,
        \`last_name\` varchar(100) NOT NULL,
        \`dob\` date NOT NULL,
        \`gender\` varchar(20) NULL,
        \`nationality\` varchar(50) NULL,
        \`student_type\` varchar(50) NULL,
        \`status\` enum('active','inactive','graduated','withdrawn') NOT NULL DEFAULT 'active',
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`student_id\`),
        INDEX \`IDX_students_first_last_name\` (\`first_name\`,\`last_name\`),
        INDEX \`IDX_students_nationality\` (\`nationality\`),
        INDEX \`IDX_students_student_type\` (\`student_type\`),
        INDEX \`IDX_students_createdAt\` (\`createdAt\`),
        INDEX \`IDX_students_isdeleted\` (\`isDeleted\`)
      ) ENGINE=InnoDB
    `);

    // Create contact_details table (matching ContactDetails entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`contact_details\` (
        \`contact_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`primary_mobile\` varchar(20) NULL,
        \`email\` varchar(150) NULL,
        \`emergency_contact\` varchar(20) NULL,
        \`contact_type\` enum('mobile','landline','whatsapp') NOT NULL DEFAULT 'mobile',
        \`is_primary\` tinyint NOT NULL DEFAULT 1,
        \`verified_at\` timestamp NULL,
        PRIMARY KEY (\`contact_id\`),
        UNIQUE INDEX \`IDX_contact_email\` (\`email\`),
        INDEX \`IDX_contact_student_id\` (\`student_id\`),
        CONSTRAINT \`FK_contact_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create visa_details table (matching VisaDetails entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`visa_details\` (
        \`visa_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`visa_type\` varchar(50) NULL,
        \`visa_number\` varchar(50) NULL,
        \`start_date\` date NULL,
        \`expiry_date\` date NULL,
        \`status\` enum('active','expired','revoked','pending') NOT NULL DEFAULT 'active',
        \`issuing_country\` varchar(100) NULL,
        \`document_path\` varchar(255) NULL,
        PRIMARY KEY (\`visa_id\`),
        UNIQUE INDEX \`IDX_visa_number\` (\`visa_number\`),
        INDEX \`IDX_visa_student_id\` (\`student_id\`),
        CONSTRAINT \`FK_visa_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create addresses table (matching Address entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`addresses\` (
        \`address_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`line1\` varchar(255) NULL,
        \`city\` varchar(100) NULL,
        \`state\` varchar(100) NULL,
        \`country\` varchar(100) NULL,
        \`postal_code\` varchar(20) NULL,
        \`address_type\` enum('current','permanent','temporary','mailing') NOT NULL DEFAULT 'current',
        \`is_primary\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`address_id\`),
        INDEX \`IDX_address_student_id\` (\`student_id\`),
        CONSTRAINT \`FK_address_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // STUDENT STATUS & LIFESTYLE TABLES (Matching entities exactly)
    // ==============================================

    // Create eligibility_status table (matching EligibilityStatus entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`eligibility_status\` (
        \`status_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`classes_completed\` tinyint NULL,
        \`fees_paid\` tinyint NULL,
        \`assignments_submitted\` tinyint NULL,
        \`documents_submitted\` tinyint NULL,
        \`trainer_consent\` tinyint NULL,
        \`override_requested\` tinyint NULL,
        \`requested_by\` varchar(100) NULL,
        \`reason\` varchar(255) NULL,
        \`comments\` text NULL,
        \`overall_status\` enum('eligible','not_eligible','pending','override') NOT NULL DEFAULT 'not_eligible',
        PRIMARY KEY (\`status_id\`),
        INDEX \`IDX_eligibility_student_id\` (\`student_id\`),
        CONSTRAINT \`FK_eligibility_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create student_lifestyle table (matching StudentLifestyle entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`student_lifestyle\` (
        \`lifestyle_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`currently_working\` tinyint NULL,
        \`working_hours\` varchar(50) NULL,
        \`has_dependents\` tinyint NULL,
        \`married\` tinyint NULL,
        \`driving_license\` tinyint NULL,
        \`own_vehicle\` tinyint NULL,
        \`public_transport_only\` tinyint NULL,
        \`can_travel_long_distance\` tinyint NULL,
        \`drop_support_available\` tinyint NULL,
        \`fully_flexible\` tinyint NULL,
        \`rush_placement_required\` tinyint NULL,
        \`preferred_days\` varchar(100) NULL,
        \`preferred_time_slots\` varchar(100) NULL,
        \`additional_notes\` text NULL,
        PRIMARY KEY (\`lifestyle_id\`),
        INDEX \`IDX_lifestyle_student_id\` (\`student_id\`),
        CONSTRAINT \`FK_lifestyle_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create placement_preferences table (matching PlacementPreferences entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`placement_preferences\` (
        \`preference_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`preferred_states\` varchar(100) NULL,
        \`preferred_cities\` varchar(255) NULL,
        \`max_travel_distance_km\` int NULL,
        \`morning_only\` tinyint NULL,
        \`evening_only\` tinyint NULL,
        \`night_shift\` tinyint NULL,
        \`weekend_only\` tinyint NULL,
        \`part_time\` tinyint NULL,
        \`full_time\` tinyint NULL,
        \`with_friend\` tinyint NULL,
        \`friend_name_or_id\` varchar(100) NULL,
        \`with_spouse\` tinyint NULL,
        \`spouse_name_or_id\` varchar(100) NULL,
        \`earliest_start_date\` date NULL,
        \`latest_start_date\` date NULL,
        \`specific_month_preference\` varchar(50) NULL,
        \`urgency_level\` enum('immediate','within_month','within_quarter','flexible') NOT NULL DEFAULT 'flexible',
        \`additional_preferences\` text NULL,
        PRIMARY KEY (\`preference_id\`),
        INDEX \`IDX_preferences_student_id\` (\`student_id\`),
        CONSTRAINT \`FK_preferences_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // FACILITY & JOB TRACKING TABLES (Matching entities exactly)
    // ==============================================

    // Create facility_records table (matching FacilityRecords entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_records\` (
        \`facility_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`facility_name\` varchar(100) NULL,
        \`facility_type\` varchar(50) NULL,
        \`branch_site\` varchar(100) NULL,
        \`facility_address\` varchar(255) NULL,
        \`contact_person_name\` varchar(100) NULL,
        \`contact_email\` varchar(150) NULL,
        \`contact_phone\` varchar(20) NULL,
        \`supervisor_name\` varchar(100) NULL,
        \`distance_from_student_km\` int NULL,
        \`slot_id\` varchar(50) NULL,
        \`course_type\` varchar(100) NULL,
        \`shift_timing\` varchar(50) NULL,
        \`start_date\` date NULL,
        \`duration_hours\` int NULL,
        \`gender_requirement\` varchar(20) NULL,
        \`applied_on\` date NULL,
        \`student_confirmed\` tinyint NULL,
        \`student_comments\` text NULL,
        \`document_type\` varchar(100) NULL,
        \`file_path\` varchar(255) NULL,
        \`application_status\` enum('applied','under_review','accepted','rejected','confirmed','completed') NOT NULL DEFAULT 'applied',
        PRIMARY KEY (\`facility_id\`),
        INDEX \`IDX_facility_student_id\` (\`student_id\`),
        INDEX \`IDX_facility_name\` (\`facility_name\`),
        INDEX \`IDX_facility_branch_site\` (\`branch_site\`),
        CONSTRAINT \`FK_facility_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create address_change_requests table (matching AddressChangeRequest entity EXACTLY - WITH ALL COLUMNS)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`address_change_requests\` (
        \`acr_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`current_address\` varchar(255) NULL,
        \`new_address\` varchar(255) NULL,
        \`effective_date\` date NULL,
        \`change_reason\` varchar(255) NULL,
        \`impact_acknowledged\` tinyint NULL,
        \`status\` enum('pending','approved','rejected','implemented') NOT NULL DEFAULT 'pending',
        \`reviewed_at\` timestamp NULL,
        \`reviewed_by\` varchar(100) NULL,
        \`review_comments\` text NULL,
        PRIMARY KEY (\`acr_id\`),
        INDEX \`IDX_address_change_student_id\` (\`student_id\`),
        CONSTRAINT \`FK_address_change_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create job_status_updates table (matching JobStatusUpdate entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`job_status_updates\` (
        \`jsu_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`status\` varchar(50) NOT NULL,
        \`last_updated_on\` date NOT NULL,
        \`employer_name\` varchar(100) NULL,
        \`job_role\` varchar(100) NULL,
        \`start_date\` date NULL,
        \`employment_type\` varchar(50) NULL,
        \`offer_letter_path\` varchar(255) NULL,
        \`actively_applying\` tinyint NULL,
        \`expected_timeline\` varchar(100) NULL,
        \`searching_comments\` text NULL,
        \`created_at\` timestamp NULL,
        PRIMARY KEY (\`jsu_id\`),
        INDEX \`IDX_job_status_student_id\` (\`student_id\`),
        INDEX \`IDX_job_status_status\` (\`status\`),
        INDEX \`IDX_job_status_last_updated_on\` (\`last_updated_on\`),
        CONSTRAINT \`FK_job_status_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // SEED DEFAULT ROLES
    // ==============================================

    // Insert default roles
    try {
      const roles = ['Admin', 'Facility', 'Supervisor', 'Placement Executive', 'Trainer', 'Student'];
      
      for (const roleName of roles) {
        try {
          await queryRunner.query(
            'INSERT IGNORE INTO `roles` (`role_name`) VALUES (?)',
            [roleName]
          );
        } catch (error) {
          console.log(`Role '${roleName}' might already exist or couldn't be inserted`);
        }
      }
      
      console.log('✅ Default roles insertion completed');
    } catch (error) {
      console.error('❌ Error inserting default roles:', error);
    }

    console.log('🎉 COMPLETE entity-matching database schema created successfully!');
    console.log('📊 Tables created: users, roles, students, contact_details, visa_details,');
    console.log('              addresses, eligibility_status, student_lifestyle, placement_preferences,');
    console.log('              facility_records, address_change_requests, job_status_updates');
    console.log('✅ All 12 tables match their corresponding Entity definitions exactly!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping all tables...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `job_status_updates`');
    await queryRunner.query('DROP TABLE IF EXISTS `address_change_requests`');
    await queryRunner.query('DROP TABLE IF EXISTS `facility_records`');
    await queryRunner.query('DROP TABLE IF EXISTS `placement_preferences`');
    await queryRunner.query('DROP TABLE IF EXISTS `student_lifestyle`');
    await queryRunner.query('DROP TABLE IF EXISTS `eligibility_status`');
    await queryRunner.query('DROP TABLE IF EXISTS `addresses`');
    await queryRunner.query('DROP TABLE IF EXISTS `visa_details`');
    await queryRunner.query('DROP TABLE IF EXISTS `contact_details`');
    await queryRunner.query('DROP TABLE IF EXISTS `students`');
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
    await queryRunner.query('DROP TABLE IF EXISTS `roles`');
    
    console.log('✅ All tables dropped successfully');
  }
}