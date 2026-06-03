import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`name\` varchar(200) NOT NULL,
        \`password\` varchar(255) NULL,
        \`role\` enum('customer','admin') NOT NULL DEFAULT 'customer',
        \`googleId\` varchar(255) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`slug\` varchar(100) NOT NULL,
        \`imageUrl\` varchar(500) NULL,
        \`parentId\` varchar(36) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_categories_slug\` (\`slug\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` varchar(36) NOT NULL,
        \`slug\` varchar(200) NOT NULL,
        \`title\` varchar(200) NOT NULL,
        \`description\` text NOT NULL,
        \`brand\` varchar(100) NOT NULL,
        \`basePriceCents\` int unsigned NOT NULL,
        \`images\` json NOT NULL DEFAULT '[]',
        \`isActive\` tinyint(1) NOT NULL DEFAULT 1,
        \`categoryId\` varchar(36) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_products_slug\` (\`slug\`),
        KEY \`IDX_products_brand\` (\`brand\`),
        KEY \`IDX_products_categoryId\` (\`categoryId\`),
        CONSTRAINT \`FK_products_categoryId\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`product_variants\` (
        \`id\` varchar(36) NOT NULL,
        \`sku\` varchar(100) NOT NULL,
        \`size\` varchar(20) NOT NULL,
        \`color\` varchar(50) NOT NULL,
        \`priceDeltaCents\` int NOT NULL DEFAULT 0,
        \`stock\` int NOT NULL DEFAULT 0,
        \`productId\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_variants_sku\` (\`sku\`),
        KEY \`IDX_variants_productId\` (\`productId\`),
        CONSTRAINT \`FK_variants_productId\` FOREIGN KEY (\`productId\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        \`status\` enum('pending','paid','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
        \`items\` json NOT NULL,
        \`totalCents\` int unsigned NOT NULL,
        \`paymentRef\` varchar(255) NULL,
        \`shippingAddressId\` varchar(36) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`IDX_orders_userId\` (\`userId\`),
        KEY \`IDX_orders_status\` (\`status\`),
        CONSTRAINT \`FK_orders_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `orders`');
    await queryRunner.query('DROP TABLE IF EXISTS `product_variants`');
    await queryRunner.query('DROP TABLE IF EXISTS `products`');
    await queryRunner.query('DROP TABLE IF EXISTS `categories`');
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
  }
}
