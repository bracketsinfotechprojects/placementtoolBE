import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFilesTable1738400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS files (
        file_id INT AUTO_INCREMENT PRIMARY KEY,
        entity_type ENUM('student', 'facility', 'placement', 'visa', 'job', 'agreement') NOT NULL COMMENT 'Type of entity this file belongs to',
        entity_id INT NOT NULL COMMENT 'ID of the entity (student_id, facility_id, etc.)',
        document_type ENUM(
          'AADHAAR',
          'PASSPORT',
          'VISA_DOCUMENT',
          'OFFER_LETTER',
          'JOB_OFFER',
          'POLICE_CHECK',
          'WORKING_WITH_CHILDREN',
          'NDIS_CHECK',
          'VACCINATION_EVIDENCE',
          'MOU_DOCUMENT',
          'INSURANCE_DOCUMENT',
          'REGISTRATION_PROOF',
          'SUPPORTING_DOCUMENT',
          'OTHER'
        ) NOT NULL COMMENT 'Type of document',
        original_filename VARCHAR(255) NOT NULL COMMENT 'Original filename uploaded by user',
        file_path VARCHAR(500) NOT NULL COMMENT 'Server-controlled file path',
        mime_type VARCHAR(50) NOT NULL COMMENT 'MIME type of the file',
        file_size INT NOT NULL COMMENT 'File size in bytes',
        version INT NOT NULL DEFAULT 1 COMMENT 'Version number for file versioning',
        is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this is the active version',
        expiry_date DATE NULL COMMENT 'Expiry date for documents like passport, visa, police check, etc.',
        notes TEXT NULL COMMENT 'Additional notes about the file',
        uploaded_by INT NULL COMMENT 'User ID who uploaded the file',
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        isDeleted TINYINT(1) NOT NULL DEFAULT 0,
        INDEX idx_file_id (file_id),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_document_type (document_type),
        INDEX idx_is_active (is_active),
        INDEX idx_expiry_date (expiry_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS files`);
  }
}
