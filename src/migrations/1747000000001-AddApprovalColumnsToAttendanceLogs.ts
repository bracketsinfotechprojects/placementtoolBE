import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovalColumnsToAttendanceLogs1747000000001 implements MigrationInterface {
  name = 'AddApprovalColumnsToAttendanceLogs1747000000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Adding approval columns to attendance_logs table...');

    await queryRunner.query(`
      ALTER TABLE \`attendance_logs\`
      ADD COLUMN \`approval_status\` enum('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Approval status of attendance (pending, approved, rejected)' AFTER \`is_deleted\`,
      ADD COLUMN \`approved_by_user_id\` int NULL COMMENT 'Foreign key to users table - who approved/rejected this attendance' AFTER \`approval_status\`,
      ADD COLUMN \`approved_at\` timestamp NULL COMMENT 'When this attendance was approved/rejected' AFTER \`approved_by_user_id\`,
      ADD COLUMN \`approval_remarks\` text NULL COMMENT 'Remarks from approver when rejecting or approving' AFTER \`approved_at\`,
      ADD CONSTRAINT \`fk_attendance_approved_by\` FOREIGN KEY (\`approved_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
    `);

    console.log('✅ Approval columns added to attendance_logs table successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Removing approval columns from attendance_logs table...');

    await queryRunner.query(`
      ALTER TABLE \`attendance_logs\`
      DROP FOREIGN KEY \`fk_attendance_approved_by\`,
      DROP COLUMN \`approval_remarks\`,
      DROP COLUMN \`approved_at\`,
      DROP COLUMN \`approved_by_user_id\`,
      DROP COLUMN \`approval_status\`
    `);

    console.log('✅ Approval columns removed from attendance_logs table successfully');
  }
}
