import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFilesTable1738200000000 implements MigrationInterface {
  name = 'CreateFilesTable1738200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`files\` (
        \`id\` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
        \`entity_type\` enum('student','facility','placement','visa','job','agreement') NOT NULL COMMENT 'Type of entity (student, facility, placement, etc.)',
        \`entity_id\` int NOT NULL COMMENT 'ID of the record in the entity table',
        \`doc_type\` enum('AADHAAR','PASSPORT','VISA_DOCUMENT','OFFER_LETTER','REGISTRATION_PROOF','SUPPORTING_DOCUMENT','MOU_DOCUMENT','INSURANCE_DOCUMENT','PLACEMENT_DOCUMENT','JOB_OFFER','OTHER') NOT NULL COMMENT 'Type of document (AADHAAR, OFFER_LETTER, etc.)',
        \`file_path\` varchar(500) NOT NULL COMMENT 'Relative path or cloud URL to the file',
        \`file_name\` varchar(255) NULL COMMENT 'Original filename',
        \`mime_type\` varchar(100) NULL COMMENT 'MIME type of the file (e.g., application/pdf, image/jpeg)',
        \`file_size\` bigint NULL COMMENT 'File size in bytes',
        \`version\` int NOT NULL DEFAULT 1 COMMENT 'Version number for file versioning',
        \`is_active\` tinyint NOT NULL DEFAULT 1 COMMENT 'Whether this file version is active',
        \`uploaded_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when file was uploaded',
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_files_id\` (\`id\`),
        INDEX \`IDX_files_entity\` (\`entity_type\`, \`entity_id\`),
        INDEX \`IDX_files_doc_type\` (\`doc_type\`),
        INDEX \`IDX_files_is_active\` (\`is_active\`),
        INDEX \`IDX_files_uploaded_at\` (\`uploaded_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Centralized file storage table for all uploaded documents';
    `);

    console.log('✅ Created files table with indexes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`files\``);
    console.log('✅ Dropped files table');
  }
}
