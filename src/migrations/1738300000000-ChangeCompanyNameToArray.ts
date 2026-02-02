import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCompanyNameToArray1738300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Convert existing string values to JSON arrays
    // This handles any existing data in the column
    await queryRunner.query(`
      UPDATE facility_agreements 
      SET company_name = JSON_ARRAY(company_name)
      WHERE company_name IS NOT NULL 
        AND company_name != ''
        AND JSON_VALID(company_name) = 0
    `);

    // Step 2: Set empty strings to NULL
    await queryRunner.query(`
      UPDATE facility_agreements 
      SET company_name = NULL
      WHERE company_name = ''
    `);

    // Step 3: Change column type from varchar to JSON
    await queryRunner.query(`
      ALTER TABLE facility_agreements 
      MODIFY COLUMN company_name JSON NULL 
      COMMENT 'Array of company names'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Convert JSON arrays back to strings (take first element)
    await queryRunner.query(`
      UPDATE facility_agreements 
      SET company_name = JSON_UNQUOTE(JSON_EXTRACT(company_name, '$[0]'))
      WHERE company_name IS NOT NULL 
        AND JSON_VALID(company_name) = 1
    `);

    // Step 2: Revert column type back to varchar
    await queryRunner.query(`
      ALTER TABLE facility_agreements 
      MODIFY COLUMN company_name VARCHAR(100) NULL 
      COMMENT 'Company name'
    `);
  }
}
