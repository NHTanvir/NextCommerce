import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  console.log('Starting database seed...');

  try {
    await queryRunner.startTransaction();

    // Admin user
    const adminHash = await bcrypt.hash('Admin@123456', 12);
    await queryRunner.query(`
      INSERT IGNORE INTO users (id, email, name, password, role, createdAt, updatedAt)
      VALUES (UUID(), 'admin@nextcommerce.dev', 'Admin User', ?, 'admin', NOW(), NOW())
    `, [adminHash]);

    // Demo customer
    const customerHash = await bcrypt.hash('Customer@123', 12);
    await queryRunner.query(`
      INSERT IGNORE INTO users (id, email, name, password, role, createdAt, updatedAt)
      VALUES (UUID(), 'customer@nextcommerce.dev', 'Demo Customer', ?, 'customer', NOW(), NOW())
    `, [customerHash]);

    // Categories
    const categories = [
      { name: 'Sneakers', slug: 'sneakers' },
      { name: 'Running', slug: 'running' },
      { name: 'Basketball', slug: 'basketball' },
      { name: 'Casual', slug: 'casual' },
      { name: 'Limited Edition', slug: 'limited-edition' },
    ];

    for (const cat of categories) {
      await queryRunner.query(`
        INSERT IGNORE INTO categories (id, name, slug) VALUES (UUID(), ?, ?)
      `, [cat.name, cat.slug]);
    }

    // Products
    const [sneakersCat] = await queryRunner.query(
      'SELECT id FROM categories WHERE slug = ?', ['sneakers']
    );
    const [runningCat] = await queryRunner.query(
      'SELECT id FROM categories WHERE slug = ?', ['running']
    );

    const products = [
      { title: 'Air Max 90', slug: 'air-max-90', brand: 'Nike', price: 14999, catId: sneakersCat?.id },
      { title: 'Air Force 1', slug: 'air-force-1', brand: 'Nike', price: 10999, catId: sneakersCat?.id },
      { title: 'Ultraboost 22', slug: 'ultraboost-22', brand: 'Adidas', price: 18999, catId: runningCat?.id },
      { title: 'Classic Leather', slug: 'classic-leather', brand: 'Reebok', price: 8999, catId: sneakersCat?.id },
      { title: 'Chuck Taylor All Star', slug: 'chuck-taylor-all-star', brand: 'Converse', price: 5999, catId: sneakersCat?.id },
    ];

    for (const p of products) {
      if (!p.catId) continue;
      await queryRunner.query(`
        INSERT IGNORE INTO products (id, slug, title, description, brand, basePriceCents, images, isActive, categoryId, createdAt, updatedAt)
        VALUES (UUID(), ?, ?, ?, ?, ?, '[]', 1, ?, NOW(), NOW())
      `, [p.slug, p.title, `${p.title} — a premium footwear choice.`, p.brand, p.price, p.catId]);
    }

    await queryRunner.commitTransaction();
    console.log('Seed complete!');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed();
