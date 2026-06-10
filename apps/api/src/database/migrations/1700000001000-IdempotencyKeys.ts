import { MigrationInterface, QueryRunner } from 'typeorm';

export class IdempotencyKeys1700000001000 implements MigrationInterface {
  name = 'IdempotencyKeys1700000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`idempotency_keys\` (
        \`key\` varchar(100) NOT NULL,
        \`userId\` varchar(36) NULL,
        \`route\` varchar(200) NOT NULL,
        \`statusCode\` int NOT NULL,
        \`responseBody\` json NOT NULL,
        \`expiresAt\` datetime NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`key\`),
        KEY \`IDX_idempotency_user\` (\`userId\`),
        KEY \`IDX_idempotency_expires\` (\`expiresAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`idempotency_keys\``);
  }
}
