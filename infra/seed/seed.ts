/**
 * Seed script — creates categories and products via the API.
 * Usage: DATABASE_URL=... JWT_SECRET=... npx ts-node infra/seed/seed.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@nextcommerce.io';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';

type SeedProduct = {
  title: string;
  slug: string;
  brand: string;
  description: string;
  category: string;
  images: { url: string }[];
  variants: { size: number; color: string; sku: string; stockQty: number; priceCents: number }[];
};

async function apiPost<T>(path_: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path_}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path_} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function main() {
  console.log('Seeding NextCommerce...');

  // 1. Register or login admin
  let token: string;
  try {
    const result = await apiPost<{ token: string }>('/auth/register', {
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    token = result.token;
    console.log('✓ Admin registered');
  } catch {
    const result = await apiPost<{ token: string }>('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    token = result.token;
    console.log('✓ Admin logged in');
  }

  // 2. Create categories
  const categoryNames = ['running', 'lifestyle', 'basketball', 'trail'];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    try {
      const cat = await apiPost<{ id: string; name: string }>('/categories', { name }, token);
      categories[name] = cat.id;
      console.log(`  ✓ Category: ${name}`);
    } catch {
      console.log(`  ~ Category already exists: ${name}`);
    }
  }

  // 3. Load categories to get IDs if they already existed
  const catsRes = await fetch(`${API_URL}/api/categories`);
  const catsData = await catsRes.json() as { id: string; name: string }[];
  for (const c of catsData) {
    categories[c.name] = c.id;
  }

  // 4. Create products
  const products: SeedProduct[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8')
  );

  for (const p of products) {
    try {
      await apiPost('/products', {
        title: p.title,
        slug: p.slug,
        brand: p.brand,
        description: p.description,
        categoryId: categories[p.category],
        images: p.images,
        variants: p.variants,
      }, token);
      console.log(`  ✓ Product: ${p.title}`);
    } catch (err) {
      console.warn(`  ~ Skipped ${p.title}: ${(err as Error).message}`);
    }
  }

  console.log('Seeding complete!');
}

main().catch((err) => { console.error(err); process.exit(1); });
