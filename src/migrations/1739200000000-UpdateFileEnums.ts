import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFileEnums1739200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update entity_type ENUM to add 'trainer'
    await queryRunner.query(`
      ALTER TABLE \`files\`
      MODIFY \`entity_type\` ENUM('student', 'facility', 'placement', 'visa', 'job', 'agreement', 'trainer') NOT NULL COMMENT 'Type of entity (student, facility, placement, etc.)'
    `);

    // Update doc_type ENUM to add new document types
    await queryRunner.query(`
      ALTER TABLE \`files\`
      MODIFY \`doc_type\` ENUM(
        'AADHAAR',
        'PASSPORT',
        'VISA_DOCUMENT',
        'OFFER_LETTER',
        'REGISTRATION_PROOF',
        'SUPPORTING_DOCUMENT',
        'MOU_DOCUMENT',
        'INSURANCE_DOCUMENT',
        'PLACEMENT_DOCUMENT',
        'JOB_OFFER',
        'WORK_CHILD_CHECK',
        'POLICE_CHECK',
        'ACCRED_CERT',
        'FIRSTAID_CERT',
        'INSURANCE_DOCS',
        'RESUME',
        'OTHER'
      ) NOT NULL COMMENT 'Type of document (AADHAAR, OFFER_LETTER, etc.)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert doc_type ENUM to original values
    await queryRunner.query(`
      ALTER TABLE \`files\`
      MODIFY \`doc_type\` ENUM(
        'AADHAAR',
        'PASSPORT',
        'VISA_DOCUMENT',
        'OFFER_LETTER',
        'REGISTRATION_PROOF',
        'SUPPORTING_DOCUMENT',
        'MOU_DOCUMENT',
        'INSURANCE_DOCUMENT',
        'PLACEMENT_DOCUMENT',
        'JOB_OFFER',
        'OTHER'
      ) NOT NULL COMMENT 'Type of document (AADHAAR, OFFER_LETTER, etc.)'
    `);

    // Revert entity_type ENUM
    await queryRunner.query(`
      ALTER TABLE \`files\`
      MODIFY \`entity_type\` ENUM('student', 'facility', 'placement', 'visa', 'job', 'agreement') NOT NULL COMMENT 'Type of entity (student, facility, placement, etc.)'
    `);
  }
}
