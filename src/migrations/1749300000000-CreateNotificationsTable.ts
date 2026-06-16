import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1749300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL                    COMMENT 'FK to users.id',
        title       VARCHAR(255) NOT NULL,
        message     TEXT NOT NULL,
        type        ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
        is_read     TINYINT(1) NOT NULL DEFAULT 0,
        action_url  VARCHAR(255) NULL               COMMENT 'Optional frontend route to navigate on click',
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_notif_user    (user_id),
        INDEX idx_notif_unread  (user_id, is_read),
        INDEX idx_notif_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
  }
}
