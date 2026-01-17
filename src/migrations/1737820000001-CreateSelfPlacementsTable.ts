import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSelfPlacementsTable1737820000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating self_placements table...');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`self_placements\` (
        \`placement_id\` int NOT NULL AUTO_INCREMENT,
        \`student_id\` int NOT NULL,
        \`facility_name\` varchar(100) NOT NULL COMMENT 'Name of the facility',
        \`facility_type\` varchar(50) NULL COMMENT 'Type of facility (Hospital, Clinic, Aged Care, etc.)',
        \`facility_address\` varchar(255) NULL COMMENT 'Complete facility address',
        \`contact_person_name\` varchar(100) NULL COMMENT 'Primary contact person name',
        \`contact_email\` varchar(150) NULL COMMENT 'Contact person email',
        \`contact_phone\` varchar(20) NULL COMMENT 'Contact person phone number',
        \`supervisor_name\` varchar(100) NULL COMMENT 'Supervisor name at facility',
        \`supporting_documents_path\` varchar(255) NULL COMMENT 'Path to supporting documents',
        \`offer_letter_path\` varchar(255) NULL COMMENT 'Path to offer/acceptance letter',
        \`registration_proof_path\` varchar(255) NULL COMMENT 'Path to facility registration proof',
        \`status\` enum('pending','under_review','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT 'Self placement application status',
        \`reviewed_at\` datetime NULL COMMENT 'When admin reviewed the application',
        \`reviewed_by\` varchar(100) NULL COMMENT 'Admin who reviewed the application',
        \`review_comments\` text NULL COMMENT 'Admin comments on the application',
        \`student_comments\` text NULL COMMENT 'Student comments about the placement',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`placement_id\`),
        INDEX \`IDX_self_placement_id\` (\`placement_id\`),
        INDEX \`IDX_self_placement_student_id\` (\`student_id\`),
        INDEX \`IDX_self_placement_facility_name\` (\`facility_name\`),
        CONSTRAINT \`FK_self_placement_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`student_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ self_placements table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Dropping self_placements table...');
    await queryRunner.query('DROP TABLE IF EXISTS `self_placements`');
    console.log('✅ self_placements table dropped');
  }
}
