import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFileDocTypeEnum1739300000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update the ENUM to include PHOTOGRAPH
    await queryRunner.query(`
      ALTER TABLE files
      MODIFY doc_type ENUM(
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
        'PHOTOGRAPH',
        'OTHER'
      ) NOT NULL COMMENT 'Type of document'
    `);

    console.log('✅ Updated doc_type ENUM to include PHOTOGRAPH');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the ENUM change
    await queryRunner.query(`
      ALTER TABLE files
      MODIFY doc_type ENUM(
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
      ) NOT NULL COMMENT 'Type of document'
    `);

    console.log('✅ Reverted doc_type ENUM');
  }
}
