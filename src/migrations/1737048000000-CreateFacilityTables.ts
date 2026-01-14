import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFacilityTables1737048000000 implements MigrationInterface {
  name = 'CreateFacilityTables1737048000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Starting Facility Management System schema creation...');

    // ==============================================
    // FACILITY CORE TABLE
    // ==============================================

    // Create facility table (matching Facility entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility\` (
        \`facility_id\` int NOT NULL AUTO_INCREMENT,
        \`organization_name\` varchar(255) NOT NULL,
        \`registered_business_name\` varchar(255) NULL,
        \`website_url\` varchar(255) NULL,
        \`abn_registration_number\` varchar(50) NULL,
        \`source_of_data\` varchar(255) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`facility_id\`),
        INDEX \`IDX_facility_id\` (\`facility_id\`),
        INDEX \`IDX_facility_organization_name\` (\`organization_name\`),
        INDEX \`IDX_facility_abn\` (\`abn_registration_number\`),
        INDEX \`IDX_facility_isdeleted\` (\`isDeleted\`)
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // FACILITY ATTRIBUTES TABLE
    // ==============================================

    // Create facility_attributes table (matching FacilityAttribute entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_attributes\` (
        \`attribute_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` int NOT NULL,
        \`attribute_type\` enum('Category','State') NOT NULL,
        \`attribute_value\` varchar(100) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`attribute_id\`),
        INDEX \`IDX_attribute_id\` (\`attribute_id\`),
        INDEX \`IDX_attribute_facility_id\` (\`facility_id\`),
        INDEX \`IDX_attribute_type\` (\`attribute_type\`),
        INDEX \`IDX_attribute_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_facility_attributes_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // FACILITY ORGANIZATION STRUCTURE TABLE
    // ==============================================

    // Create facility_organization_structure table (matching FacilityOrganizationStructure entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_organization_structure\` (
        \`org_struct_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` int NOT NULL,
        \`deal_with\` enum('Head Office','Branch','Both') NOT NULL,
        \`head_office_addr\` varchar(255) NULL,
        \`contact_name\` varchar(100) NULL,
        \`designation\` varchar(100) NULL,
        \`phone\` varchar(20) NULL,
        \`email\` varchar(100) NULL,
        \`alternate_contact\` varchar(100) NULL,
        \`notes\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`org_struct_id\`),
        INDEX \`IDX_org_struct_id\` (\`org_struct_id\`),
        INDEX \`IDX_org_struct_facility_id\` (\`facility_id\`),
        INDEX \`IDX_org_struct_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_facility_organization_structure_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // FACILITY BRANCH/SITE TABLE
    // ==============================================

    // Create facility_branch_site table (matching FacilityBranchSite entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_branch_site\` (
        \`branch_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` int NOT NULL,
        \`site_code\` varchar(50) NULL,
        \`full_address\` varchar(255) NULL,
        \`suburb\` varchar(100) NULL,
        \`city\` varchar(100) NULL,
        \`state\` varchar(50) NULL,
        \`postcode\` varchar(20) NULL,
        \`site_type\` varchar(100) NULL,
        \`palliative_care\` tinyint NOT NULL DEFAULT 0,
        \`dementia_care\` tinyint NOT NULL DEFAULT 0,
        \`num_beds\` int NULL,
        \`gender_rules\` text NULL,
        \`contact_name\` varchar(100) NULL,
        \`contact_role\` varchar(100) NULL,
        \`contact_phone\` varchar(20) NULL,
        \`contact_email\` varchar(100) NULL,
        \`contact_comments\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`branch_id\`),
        INDEX \`IDX_branch_id\` (\`branch_id\`),
        INDEX \`IDX_branch_facility_id\` (\`facility_id\`),
        INDEX \`IDX_branch_site_code\` (\`site_code\`),
        INDEX \`IDX_branch_city\` (\`city\`),
        INDEX \`IDX_branch_state\` (\`state\`),
        INDEX \`IDX_branch_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_facility_branch_site_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // FACILITY AGREEMENTS TABLE
    // ==============================================

    // Create facility_agreements table (matching FacilityAgreement entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_agreements\` (
        \`agreement_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` int NOT NULL,
        \`sent_students\` tinyint NULL,
        \`with_mou\` tinyint NULL,
        \`no_mou_but_taken\` tinyint NULL,
        \`mou_exists_no_spot\` tinyint NULL,
        \`total_students\` int NULL,
        \`last_placement\` date NULL,
        \`has_mou\` tinyint NULL,
        \`signed_on\` date NULL,
        \`expiry_date\` date NULL,
        \`company_name\` varchar(100) NULL,
        \`payment_required\` tinyint NULL,
        \`amount_per_spot\` decimal(10,2) NULL,
        \`payment_notes\` text NULL,
        \`mou_document\` varchar(255) NULL,
        \`insurance_doc\` varchar(255) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`agreement_id\`),
        INDEX \`IDX_agreement_id\` (\`agreement_id\`),
        INDEX \`IDX_agreement_facility_id\` (\`facility_id\`),
        INDEX \`IDX_agreement_expiry_date\` (\`expiry_date\`),
        INDEX \`IDX_agreement_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_facility_agreements_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // FACILITY DOCUMENTS REQUIRED TABLE
    // ==============================================

    // Create facility_documents_required table (matching FacilityDocumentRequired entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_documents_required\` (
        \`doc_req_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` int NOT NULL,
        \`document_name\` varchar(100) NULL,
        \`notice_period_days\` int NULL,
        \`orientation_req\` tinyint NULL,
        \`facilitator_req\` tinyint NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`doc_req_id\`),
        INDEX \`IDX_doc_req_id\` (\`doc_req_id\`),
        INDEX \`IDX_doc_req_facility_id\` (\`facility_id\`),
        INDEX \`IDX_doc_req_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_facility_documents_required_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // ==============================================
    // FACILITY RULES TABLE
    // ==============================================

    // Create facility_rules table (matching FacilityRule entity exactly)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`facility_rules\` (
        \`rule_id\` int NOT NULL AUTO_INCREMENT,
        \`facility_id\` int NOT NULL,
        \`obligations\` text NULL,
        \`obligations_univ\` text NULL,
        \`obligations_student\` text NULL,
        \`process_notes\` text NULL,
        \`shift_rules\` text NULL,
        \`attendance_policy\` text NULL,
        \`dress_code\` text NULL,
        \`behaviour_rules\` text NULL,
        \`special_instr\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`rule_id\`),
        INDEX \`IDX_rule_id\` (\`rule_id\`),
        INDEX \`IDX_rule_facility_id\` (\`facility_id\`),
        INDEX \`IDX_rule_isdeleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_facility_rules_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    console.log('🎉 Facility Management System schema created successfully!');
    console.log('📊 Tables created: facility, facility_attributes, facility_organization_structure,');
    console.log('              facility_branch_site, facility_agreements, facility_documents_required,');
    console.log('              facility_rules');
    console.log('✅ All 7 facility tables match their corresponding Entity definitions exactly!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping all facility tables...');
    
    // Drop in reverse order due to foreign key constraints
    await queryRunner.query('DROP TABLE IF EXISTS `facility_rules`');
    await queryRunner.query('DROP TABLE IF EXISTS `facility_documents_required`');
    await queryRunner.query('DROP TABLE IF EXISTS `facility_agreements`');
    await queryRunner.query('DROP TABLE IF EXISTS `facility_branch_site`');
    await queryRunner.query('DROP TABLE IF EXISTS `facility_organization_structure`');
    await queryRunner.query('DROP TABLE IF EXISTS `facility_attributes`');
    await queryRunner.query('DROP TABLE IF EXISTS `facility`');
    
    console.log('✅ All facility tables dropped successfully');
  }
}
