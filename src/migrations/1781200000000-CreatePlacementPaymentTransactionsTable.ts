import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlacementPaymentTransactionsTable1781200000000 implements MigrationInterface {
  name = 'CreatePlacementPaymentTransactionsTable1781200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating placement_payment_transactions table...');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`placement_payment_transactions\` (
        \`transaction_id\` int NOT NULL AUTO_INCREMENT,
        \`placementslot_id\` int NOT NULL COMMENT 'Reference to placement_slots table',
        \`facility_id\` int NOT NULL COMMENT 'Denormalized reference to facility table',

        \`amount\` decimal(12,2) NOT NULL COMMENT 'Amount paid in this transaction',
        \`payment_date\` date NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Date the payment was made',
        \`payment_reference\` varchar(255) NULL COMMENT 'Bank transfer / cheque / transaction reference',
        \`invoice_number\` varchar(100) NULL COMMENT 'Invoice number associated with this payment',
        \`notes\` text NULL COMMENT 'Free-text notes about this payment',
        \`proof_attachments\` json NULL COMMENT 'Array of uploaded proof-of-payment file paths',

        \`status\` enum('Recorded','Reversed') NOT NULL DEFAULT 'Recorded' COMMENT 'Recorded or Reversed (soft-cancelled, never hard-deleted)',
        \`reversal_reason\` text NULL COMMENT 'Reason given when this transaction was reversed',

        \`paid_by\` int NOT NULL COMMENT 'User (admin) who recorded this payment',

        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
        \`updated_at\` timestamp NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',

        PRIMARY KEY (\`transaction_id\`),
        INDEX \`IDX_placement_payment_txn_slot_id\` (\`placementslot_id\`),
        INDEX \`IDX_placement_payment_txn_facility_id\` (\`facility_id\`),
        INDEX \`IDX_placement_payment_txn_payment_date\` (\`payment_date\`),
        INDEX \`IDX_placement_payment_txn_status\` (\`status\`),

        CONSTRAINT \`fk_placement_payment_txn_slot\` FOREIGN KEY (\`placementslot_id\`) REFERENCES \`placement_slots\`(\`placementslot_id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fk_placement_payment_txn_facility\` FOREIGN KEY (\`facility_id\`) REFERENCES \`facility\`(\`facility_id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`fk_placement_payment_txn_user\` FOREIGN KEY (\`paid_by\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ placement_payment_transactions table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping placement_payment_transactions table...');

    await queryRunner.query('DROP TABLE IF EXISTS `placement_payment_transactions`');

    console.log('✅ placement_payment_transactions table dropped successfully');
  }
}
