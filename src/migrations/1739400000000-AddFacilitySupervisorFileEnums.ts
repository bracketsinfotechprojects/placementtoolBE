import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacilitySupervisorFileEnums1739400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update entity_type ENUM to add 'facility_supervisor'
    await queryRunner.query(`
      ALTER TABLE \`files\`
      MODIFY \`entity_type\` ENUM(
        'student',
        'facility',
        'placement',
        'placement_executive',
        'visa',
        'job',
        'agreement',
        'trainer',
        'facility_supervisor'
      ) NOT NULL COMMENT 'Type of entity (student, facility, placement, etc.)'
    `);

    // Update doc_type ENUM to add 'PHOTOGRAPH', 'ID_PROOF', 'AUTHORIZATION_LETTER'
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
        'PHOTOGRAPH',
        'ID_PROOF',
        'AUTHORIZATION_LETTER',
        'OTHER'
      ) NOT NULL COMMENT 'Type of document (AADHAAR, OFFER_LETTER, etc.)'
    `);

    console.log('✅ Added facility_supervisor entity_type and PHOTOGRAPH, ID_PROOF, AUTHORIZATION_LETTER doc_types');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert doc_type ENUM
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

    // Revert entity_type ENUM
    await queryRunner.query(`
      ALTER TABLE \`files\`
      MODIFY \`entity_type\` ENUM(
        'student',
        'facility',
        'placement',
        'placement_executive',
        'visa',
        'job',
        'agreement',
        'trainer'
      ) NOT NULL COMMENT 'Type of entity (student, facility, placement, etc.)'
    `);

    console.log('✅ Reverted facility_supervisor enum changes');
  }
}
