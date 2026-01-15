import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetsTable1737820000000 implements MigrationInterface {
  name = 'CreatePasswordResetsTable1737820000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Creating password_resets table...');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`password_resets\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`otp\` varchar(10) NOT NULL,
        \`expiry\` datetime NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_password_resets_id\` (\`id\`),
        INDEX \`IDX_password_resets_user_id\` (\`user_id\`),
        INDEX \`IDX_password_resets_expiry\` (\`expiry\`),
        CONSTRAINT \`FK_password_resets_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    console.log('✅ password_resets table created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Dropping password_resets table...');
    
    await queryRunner.query('DROP TABLE IF EXISTS `password_resets`');
    
    console.log('✅ password_resets table dropped successfully');
  }
}
