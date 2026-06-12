import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationPayload1700000002000 implements MigrationInterface {
  name = 'NotificationPayload1700000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD COLUMN \`payload\` json NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notifications\` ADD COLUMN \`readAt\` datetime NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`notifications\` DROP COLUMN \`readAt\``);
    await queryRunner.query(`ALTER TABLE \`notifications\` DROP COLUMN \`payload\``);
  }
}
