-- Complete Database Schema for CRM Application
-- This file creates all tables with all required fields based on entity definitions

-- ==============================================
-- USER ROLES SYSTEM
-- ==============================================

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    isDeleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table (matching User entity)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loginID VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    userRole VARCHAR(50) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    isDeleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- ==============================================
-- STUDENT CORE TABLES
-- ==============================================

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NULL,
    nationality VARCHAR(50) NULL,
    student_type VARCHAR(50) NULL,
    status ENUM('active','inactive','graduated','withdrawn') NOT NULL DEFAULT 'active',
    isDeleted TINYINT NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create contact_details table
CREATE TABLE IF NOT EXISTS contact_details (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    primary_mobile VARCHAR(20) NULL,
    email VARCHAR(150) NULL,
    emergency_contact VARCHAR(20) NULL,
    contact_type ENUM('mobile','landline','whatsapp') NOT NULL DEFAULT 'mobile',
    is_primary TINYINT NOT NULL DEFAULT 1,
    verified_at TIMESTAMP NULL,
    UNIQUE INDEX IDX_contact_email (email),
    INDEX IDX_contact_student_id (student_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create visa_details table
CREATE TABLE IF NOT EXISTS visa_details (
    visa_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    visa_type VARCHAR(50) NULL,
    visa_number VARCHAR(50) NULL,
    start_date DATE NULL,
    expiry_date DATE NULL,
    status ENUM('active','expired','revoked','pending') NOT NULL DEFAULT 'active',
    issuing_country VARCHAR(100) NULL,
    document_path VARCHAR(255) NULL,
    UNIQUE INDEX IDX_visa_number (visa_number),
    INDEX IDX_visa_student_id (student_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    line1 VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    country VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    address_type ENUM('current','permanent','temporary','mailing') NOT NULL DEFAULT 'current',
    is_primary TINYINT NOT NULL DEFAULT 0,
    INDEX IDX_address_student_id (student_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ==============================================
-- STUDENT STATUS & LIFESTYLE TABLES
-- ==============================================

-- Create eligibility_status table (with all fields)
CREATE TABLE IF NOT EXISTS eligibility_status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    classes_completed TINYINT NULL,
    fees_paid TINYINT NULL,
    assignments_submitted TINYINT NULL,
    documents_submitted TINYINT NULL,
    trainer_consent TINYINT NULL,
    override_requested TINYINT NULL,
    requested_by VARCHAR(100) NULL,
    reason VARCHAR(255) NULL,
    comments TEXT NULL,
    overall_status ENUM('eligible','not_eligible','pending','override') NOT NULL DEFAULT 'not_eligible',
    isDeleted TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX IDX_eligibility_student_id (student_id),
    INDEX IDX_eligibility_status_overall (overall_status),
    INDEX IDX_eligibility_isdeleted (isDeleted),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create student_lifestyle table
CREATE TABLE IF NOT EXISTS student_lifestyle (
    lifestyle_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    currently_working TINYINT NULL,
    working_hours VARCHAR(50) NULL,
    has_dependents TINYINT NULL,
    married TINYINT NULL,
    driving_license TINYINT NULL,
    own_vehicle TINYINT NULL,
    public_transport_only TINYINT NULL,
    can_travel_long_distance TINYINT NULL,
    drop_support_available TINYINT NULL,
    fully_flexible TINYINT NULL,
    rush_placement_required TINYINT NULL,
    preferred_days VARCHAR(100) NULL,
    preferred_time_slots VARCHAR(100) NULL,
    additional_notes TEXT NULL,
    INDEX IDX_lifestyle_student_id (student_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create placement_preferences table
CREATE TABLE IF NOT EXISTS placement_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    preferred_states VARCHAR(100) NULL,
    preferred_cities VARCHAR(255) NULL,
    max_travel_distance_km INT NULL,
    morning_only TINYINT NULL,
    evening_only TINYINT NULL,
    night_shift TINYINT NULL,
    weekend_only TINYINT NULL,
    part_time TINYINT NULL,
    full_time TINYINT NULL,
    with_friend TINYINT NULL,
    friend_name_or_id VARCHAR(100) NULL,
    with_spouse TINYINT NULL,
    spouse_name_or_id VARCHAR(100) NULL,
    earliest_start_date DATE NULL,
    latest_start_date DATE NULL,
    specific_month_preference VARCHAR(50) NULL,
    urgency_level ENUM('immediate','within_month','within_quarter','flexible') NOT NULL DEFAULT 'flexible',
    additional_preferences TEXT NULL,
    INDEX IDX_preferences_student_id (student_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ==============================================
-- FACILITY & JOB TRACKING TABLES
-- ==============================================

-- Create facility_records table (with all fields)
CREATE TABLE IF NOT EXISTS facility_records (
    facility_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    facility_name VARCHAR(100) NULL,
    facility_type VARCHAR(50) NULL,
    branch_site VARCHAR(100) NULL,
    facility_address VARCHAR(255) NULL,
    contact_person_name VARCHAR(100) NULL,
    contact_email VARCHAR(150) NULL,
    contact_phone VARCHAR(20) NULL,
    supervisor_name VARCHAR(100) NULL,
    distance_from_student_km INT NULL,
    slot_id VARCHAR(50) NULL,
    course_type VARCHAR(100) NULL,
    shift_timing VARCHAR(50) NULL,
    start_date DATE NULL,
    duration_hours INT NULL,
    gender_requirement VARCHAR(20) NULL,
    applied_on DATE NULL,
    student_confirmed TINYINT NULL,
    student_comments TEXT NULL,
    document_type VARCHAR(100) NULL,
    file_path VARCHAR(255) NULL,
    application_status ENUM('applied','under_review','accepted','rejected','confirmed','completed') NOT NULL DEFAULT 'applied',
    INDEX IDX_facility_student_id (student_id),
    INDEX IDX_facility_name (facility_name),
    INDEX IDX_facility_branch_site (branch_site),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create address_change_requests table
CREATE TABLE IF NOT EXISTS address_change_requests (
    acr_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    current_address VARCHAR(255) NULL,
    new_address VARCHAR(255) NULL,
    effective_date DATE NULL,
    change_reason VARCHAR(255) NULL,
    impact_acknowledged TINYINT NULL,
    status ENUM('pending','approved','rejected','implemented') NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(100) NULL,
    review_comments TEXT NULL,
    INDEX IDX_address_change_student_id (student_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create job_status_updates table (with all fields)
CREATE TABLE IF NOT EXISTS job_status_updates (
    jsu_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_updated_on DATE NOT NULL,
    employer_name VARCHAR(100) NULL,
    job_role VARCHAR(100) NULL,
    start_date DATE NULL,
    employment_type VARCHAR(50) NULL,
    offer_letter_path VARCHAR(255) NULL,
    actively_applying TINYINT NULL,
    expected_timeline VARCHAR(100) NULL,
    searching_comments TEXT NULL,
    created_at TIMESTAMP NULL,
    INDEX IDX_job_status_student_id (student_id),
    INDEX IDX_job_status_status (status),
    INDEX IDX_job_status_last_updated_on (last_updated_on),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_students_isdeleted ON students(isDeleted);
CREATE INDEX IF NOT EXISTS idx_users_isdeleted ON users(isDeleted);
CREATE INDEX IF NOT EXISTS idx_roles_isdeleted ON roles(isDeleted);

-- ==============================================
-- DEFAULT DATA
-- ==============================================

-- Insert default roles
INSERT IGNORE INTO roles (role_name) VALUES 
('Admin'), 
('Facility'), 
('Supervisor'),
('Placement Executive'), 
('Trainer'), 
('Student');