/**
 * Read-only stand-in for the NestJS API, for the public demo only.
 *
 * The real API needs MySQL, Redis and RabbitMQ over TCP, none of which a
 * Worker can reach, so the deployed storefront would otherwise have no
 * catalog at all. This serves the same JSON shapes as
 * `CatalogService.toDto` / `RecommendationsService` out of the seed file
 * that `infra/seed/seed.ts` loads, so the web app talks to it unmodified.
 *
 * Writes (auth, checkout, admin) are not emulated: they answer 404 and the
 * storefront falls back to its local Redux state, which is where the cart,
 * wishlist and compare lists already live.
 */
import seed from '../../seed/products.json';

type SeedVariant = {
  size: number;
  color: string;
  sku: string;
  stockQty: number;
  priceCents: number;
};

type SeedProduct = {
  title: string;
  slug: string;
  brand: string;
  description: string;
  category: string;
  images: { url: string }[];
  variants: SeedVariant[];
};

/**
 * Stable ids without a database: the same slug or sku must produce the same
 * id on every isolate and every deploy, because the web app puts these ids
 * in URLs and in its localStorage-backed slices.
 */
function uuidFrom(seedText: string): string {
  let h1 = 0x9e3779b9;
  let h2 = 0x85ebca6b;
  for (let i = 0; i < seedText.length; i += 1) {
    const c = seedText.charCodeAt(i);
    h1 = (Math.imul(h1 ^ c, 0x01000193) + 0x7ed55d16) >>> 0;
    h2 = (Math.imul(h2 + c, 0x85ebca6b) ^ (h1 >>> 7)) >>> 0;
  }
  const hex = (n: number) => n.toString(16).padStart(8, '0');
  const a = hex(h1);
  const b = hex(h2);
  const c = hex(Math.imul(h1 ^ h2, 0xc2b2ae35) >>> 0);
  const d = hex(Math.imul(h1 + h2, 0x27d4eb2f) >>> 0);
  return `${a}-${b.slice(0, 4)}-4${b.slice(5, 8)}-a${c.slice(1, 4)}-${c.slice(4)}${d}`;
}

const products: SeedProduct[] = seed as SeedProduct[];

const CATEGORY_LABELS: Record<string, string> = {
  running: 'Running',
  lifestyle: 'Lifestyle',
  basketball: 'Basketball',
  trail: 'Trail',
};

const categoryNames = [...new Set(products.map((p) => p.category))];

const categories = categoryNames.map((name) => ({
  id: uuidFrom(`category:${name}`),
  slug: name,
  name,
  label: CATEGORY_LABELS[name] ?? name,
  children: [] as never[],
  createdAt: new Date('2026-01-05T00:00:00.000Z').toISOString(),
}));

const categoryById = new Map(categories.map((c) => [c.id, c]));
const categoryByName = new Map(categories.map((c) => [c.name, c]));

/**
 * The seed file carries no sale price and no timestamps — the real catalog
 * gets those from admin edits and from MySQL. Deriving them from the index
 * keeps /catalog/deals, /catalog/featured and /catalog/new-arrivals
 * populated without inventing a second source of product data, and basing
 * createdAt on request time keeps new-arrivals (a 30-day window) from
 * emptying out as the deploy ages.
 */
const DAY = 24 * 60 * 60 * 1000;

const catalog = products.map((p, i) => {
  const basePriceCents = Math.min(...p.variants.map((v) => v.priceCents));
  const onSale = i % 3 === 0;
  const discount = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35][i % 6];
  const category = categoryByName.get(p.category)!;
  return {
    id: uuidFrom(`product:${p.slug}`),
    slug: p.slug,
    title: p.title,
    description: p.description,
    brand: p.brand,
    basePriceCents,
    salePriceCents: onSale ? Math.round((basePriceCents * (1 - discount)) / 100) * 100 - 1 : null,
    categoryId: category.id,
    categoryName: category.name,
    images: p.images.map((img) => ({ url: img.url, alt: p.title })),
    variants: p.variants.map((v) => ({
      id: uuidFrom(`variant:${v.sku}`),
      size: Number(v.size),
      color: v.color,
      sku: v.sku,
      stockQty: v.stockQty,
      priceCents: v.priceCents,
    })),
    isActive: true,
    ageDays: i * 1.5,
  };
});

type CatalogEntry = (typeof catalog)[number];

function toDto(p: CatalogEntry, now: number) {
  const discountPct =
    p.salePriceCents && p.salePriceCents < p.basePriceCents
      ? Math.round(((p.basePriceCents - p.salePriceCents) / p.basePriceCents) * 100)
      : 0;
  const category = categoryById.get(p.categoryId)!;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    brand: p.brand,
    basePriceCents: p.basePriceCents,
    salePriceCents: p.salePriceCents,
    discountPct,
    categoryId: p.categoryId,
    categoryName: category.name,
    category: { id: category.id, slug: category.slug, name: category.name, parentId: null },
    images: p.images,
    variants: p.variants,
    isActive: true,
    createdAt: new Date(now - p.ageDays * DAY).toISOString(),
  };
}

function toSlim(p: CatalogEntry, reason: 'same_brand' | 'same_category' | 'popular') {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    brand: p.brand,
    basePriceCents: p.basePriceCents,
    imageUrl: p.images[0]?.url,
    categoryName: categoryById.get(p.categoryId)!.name,
    reason,
  };
}

/** Curated groups, so /collections and /bundles are not dead ends. */
const COLLECTIONS = [
  {
    slug: 'summer-essentials',
    name: 'Summer Essentials',
    description: 'Light, breathable, iconic — the warm-weather rotation.',
    discountPercent: 15,
    pick: (p: CatalogEntry) => p.categoryName === 'lifestyle' || p.categoryName === 'running',
  },
  {
    slug: 'performance-series',
    name: 'Performance Series',
    description: 'Race-day shoes and court weapons, built for champions.',
    discountPercent: 20,
    pick: (p: CatalogEntry) => p.categoryName === 'running' || p.categoryName === 'basketball',
  },
  {
    slug: 'street-style',
    name: 'Street Style',
    description: 'Wear your identity. Everyday silhouettes with a history.',
    discountPercent: 10,
    pick: (p: CatalogEntry) => p.categoryName === 'lifestyle' || p.categoryName === 'trail',
  },
].map((c, i) => {
  const picked = catalog.filter(c.pick).slice(0, 8);
  return {
    id: uuidFrom(`collection:${c.slug}`),
    name: c.name,
    slug: c.slug,
    description: c.description,
    bannerImageUrl: picked[0]?.images[0]?.url ?? null,
    productIds: picked.map((p) => p.id),
    discountPercent: c.discountPercent,
    isActive: true,
    startsAt: null,
    endsAt: new Date(Date.UTC(2027, 0, 1 + i * 14)).toISOString(),
  };
});

const BUNDLES = [
  {
    name: 'Road Runner Kit',
    description: 'A daily trainer and a race-day pair.',
    discountPercent: 12,
    category: 'running',
  },
  {
    name: 'Court Pack',
    description: 'Two basketball silhouettes, one price.',
    discountPercent: 15,
    category: 'basketball',
  },
  {
    name: 'Trail Starter',
    description: 'Grip and protection for the first ultra.',
    discountPercent: 10,
    category: 'trail',
  },
].map((b, i) => {
  const picked = catalog.filter((p) => p.categoryName === b.category).slice(0, 2);
  return {
    id: uuidFrom(`bundle:${b.name}`),
    name: b.name,
    description: b.description,
    productIds: picked.map((p) => p.id),
    discountPercent: b.discountPercent,
    isActive: true,
    startsAt: null,
    endsAt: new Date(Date.UTC(2027, 0, 15 + i * 10)).toISOString(),
  };
});

const TAGS = [
  ...new Set([
    ...categoryNames.map((c) => CATEGORY_LABELS[c] ?? c),
    ...catalog.map((p) => p.brand),
    'cushioned',
    'lightweight',
    'waterproof',
    'carbon-plate',
    'wide-fit',
    'retro',
    'sale',
  ]),
].sort();

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'authorization,content-type',
  'access-control-max-age': '86400',
};

function json(body: unknown, status = 200, maxAge = 300): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status === 200 ? `public, max-age=${maxAge}` : 'no-store',
      'x-demo-api': 'read-only catalog stand-in for the NextCommerce demo',
      ...CORS,
    },
  });
}

function notFound(path: string): Response {
  return json(
    {
      statusCode: 404,
      message: `${path} is not served by the read-only demo API. Run the full NestJS stack with "docker compose up" for auth, cart, checkout and admin.`,
    },
    404,
  );
}

function num(v: string | null, fallback: number): number {
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function matches(p: CatalogEntry, q: URLSearchParams): boolean {
  const categoryId = q.get('categoryId') ?? q.get('category');
  if (categoryId) {
    // The products page passes ?category=running straight through as
    // categoryId, so accept a name or a slug as well as the uuid.
    const wanted = categoryById.get(categoryId) ?? categoryByName.get(categoryId);
    if (!wanted || wanted.id !== p.categoryId) return false;
  }
  const brand = q.get('brand');
  if (brand && p.brand.toLowerCase() !== brand.toLowerCase()) return false;
  const search = q.get('search') ?? q.get('q');
  if (search) {
    const needle = search.toLowerCase();
    const haystack = `${p.title} ${p.brand} ${p.description}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  const minPrice = q.get('minPrice');
  if (minPrice && p.basePriceCents < Number(minPrice)) return false;
  const maxPrice = q.get('maxPrice');
  if (maxPrice && p.basePriceCents > Number(maxPrice)) return false;
  const color = q.get('color');
  if (color && !p.variants.some((v) => v.color.toLowerCase() === color.toLowerCase())) return false;
  const size = q.get('size');
  if (size && !p.variants.some((v) => v.size === Number(size))) return false;
  return true;
}

function paginate(items: CatalogEntry[], q: URLSearchParams, now: number) {
  const page = Math.max(1, num(q.get('page'), 1));
  const limit = Math.min(100, Math.max(1, num(q.get('limit'), 20)));
  const total = items.length;
  return {
    data: items.slice((page - 1) * limit, page * limit).map((p) => toDto(p, now)),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);
    const q = url.searchParams;
    const now = Date.now();

    // Parts of the web app assume NEXT_PUBLIC_API_URL already ends in /api
    // and parts append it themselves, so both prefixes have to work.
    const path = url.pathname.replace(/^\/api(?=\/|$)/, '').replace(/\/$/, '') || '/';
    const seg = path.split('/').filter(Boolean);

    if (path === '/' || path === '/health/live' || path === '/health/ready') {
      return json({
        status: 'ok',
        service: 'nextcommerce-demo-api',
        mode: 'read-only catalog',
        products: catalog.length,
        docs: 'https://github.com/NHTanvir/NextCommerce',
      });
    }

    if (request.method !== 'GET') {
      if (path === '/newsletter/subscribe') return json({ ok: true, demo: true });
      return notFound(path);
    }

    // ---- catalog ----
    if (seg[0] === 'catalog' || seg[0] === 'products') {
      const rest = seg[0] === 'catalog' ? seg.slice(1) : ['products', ...seg.slice(1)];

      if (rest[0] === 'products' && rest.length === 1) {
        return json(
          paginate(
            catalog.filter((p) => matches(p, q)),
            q,
            now,
          ),
        );
      }

      if (rest[0] === 'products' && rest[1] === 'id' && rest[2]) {
        const p = catalog.find((x) => x.id === rest[2]);
        return p ? json(toDto(p, now)) : notFound(path);
      }

      if (rest[0] === 'products' && rest[1] && rest.length === 2) {
        const p = catalog.find((x) => x.slug === rest[1] || x.id === rest[1]);
        return p
          ? json(toDto(p, now))
          : json({ statusCode: 404, message: 'Product not found' }, 404);
      }

      if (rest[0] === 'products' && rest[2] === 'variants') {
        const p = catalog.find((x) => x.id === rest[1] || x.slug === rest[1]);
        return p ? json([...p.variants].sort((a, b) => a.size - b.size)) : notFound(path);
      }

      if (rest[0] === 'products' && rest[2] === 'related') {
        const p = catalog.find((x) => x.id === rest[1] || x.slug === rest[1]);
        if (!p) return json({ products: [] });
        const limit = num(q.get('limit'), 8);
        const sameBoth = catalog.filter(
          (x) => x.id !== p.id && x.brand === p.brand && x.categoryId === p.categoryId,
        );
        const sameBrand = catalog.filter(
          (x) => x.id !== p.id && x.brand === p.brand && x.categoryId !== p.categoryId,
        );
        const sameCategory = catalog.filter(
          (x) => x.id !== p.id && x.brand !== p.brand && x.categoryId === p.categoryId,
        );
        const out = [
          ...sameBoth.map((x) => toSlim(x, 'same_brand')),
          ...sameBrand.map((x) => toSlim(x, 'same_brand')),
          ...sameCategory.map((x) => toSlim(x, 'same_category')),
        ].slice(0, limit);
        return json({ products: out });
      }

      if (rest[0] === 'trending') {
        const limit = num(q.get('limit'), 8);
        // No order history in the demo, so "trending" is the newest slice,
        // which is what getTopSellers falls back to in the real service.
        return json({ products: catalog.slice(0, limit).map((p) => toSlim(p, 'popular')) });
      }

      if (rest[0] === 'categories') {
        return json(
          categories.map(({ id, slug, name, children }) => ({ id, slug, name, children })),
        );
      }

      if (rest[0] === 'brands') {
        const counts = new Map<string, number>();
        for (const p of catalog) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
        return json(
          [...counts.entries()]
            .map(([brand, productCount]) => ({ brand, productCount }))
            .sort((a, b) => b.productCount - a.productCount || a.brand.localeCompare(b.brand)),
        );
      }

      if (rest[0] === 'deals') {
        const minDiscount = num(q.get('minDiscount'), 0);
        const limit = Math.min(100, num(q.get('limit'), 20));
        const page = Math.max(1, num(q.get('page'), 1));
        const onSale = catalog
          .filter((p) => p.salePriceCents && p.salePriceCents < p.basePriceCents)
          .map((p) => ({
            p,
            pct: Math.round(((p.basePriceCents - p.salePriceCents!) / p.basePriceCents) * 100),
          }))
          .filter((x) => x.pct >= minDiscount)
          .sort((a, b) => b.pct - a.pct);
        return json({
          data: onSale.slice((page - 1) * limit, page * limit).map((x) => toDto(x.p, now)),
          total: onSale.length,
          page,
          totalPages: Math.max(1, Math.ceil(onSale.length / limit)),
        });
      }

      if (rest[0] === 'new-arrivals') {
        const days = num(q.get('days'), 30);
        const limit = Math.min(100, num(q.get('limit'), 20));
        return json(
          catalog
            .filter((p) => p.ageDays <= days)
            .sort((a, b) => a.ageDays - b.ageDays)
            .slice(0, limit)
            .map((p) => toDto(p, now)),
        );
      }

      if (rest[0] === 'featured') {
        const limit = Math.min(100, num(q.get('limit'), 12));
        const sale = catalog.filter((p) => p.salePriceCents);
        const rest2 = catalog.filter((p) => !p.salePriceCents);
        return json([...sale, ...rest2].slice(0, limit).map((p) => toDto(p, now)));
      }

      if (rest[0] === 'search' && rest[1] === 'suggestions') {
        const term = (q.get('q') ?? '').toLowerCase();
        const limit = Math.min(20, num(q.get('limit'), 8));
        if (term.length < 2) return json([]);
        return json(
          catalog
            .filter((p) => `${p.title} ${p.brand}`.toLowerCase().includes(term))
            .slice(0, limit)
            .map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              brand: p.brand,
              priceCents: p.basePriceCents,
            })),
        );
      }

      if (rest[0] === 'export' || rest[0] === 'health') return notFound(path);
    }

    // ---- search ----
    if (seg[0] === 'search') {
      const term = (q.get('q') ?? '').toLowerCase();
      if (seg[1] === 'autocomplete') {
        if (term.length < 2) return json([]);
        return json(
          catalog
            .filter((p) => `${p.title} ${p.brand}`.toLowerCase().includes(term))
            .slice(0, 8)
            .map((p) => p.title),
        );
      }
      if (seg.length === 1) {
        return json(
          paginate(
            catalog.filter((p) => matches(p, q)),
            q,
            now,
          ),
        );
      }
    }

    // ---- collections and bundles ----
    if (seg[0] === 'collections') {
      if (seg.length === 1) return json(COLLECTIONS);
      const c = COLLECTIONS.find((x) => x.slug === seg[1] || x.id === seg[1]);
      return c ? json(c) : json({ statusCode: 404, message: 'Collection not found' }, 404);
    }

    if (seg[0] === 'bundles') {
      if (seg.length === 1) return json(BUNDLES);
      const b = BUNDLES.find((x) => x.id === seg[1]);
      return b ? json(b) : json({ statusCode: 404, message: 'Bundle not found' }, 404);
    }

    if (seg[0] === 'tags' && seg.length === 1) return json(TAGS);

    // ---- endpoints that exist but have nothing to show without a database ----
    // An empty 200 is what the storefront is written to handle; a 404 here
    // would light up error states on pages that are otherwise fine.
    if (seg[0] === 'reviews' && seg[1] === 'distribution') {
      return json({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    }
    if (seg[0] === 'reviews' && seg.length === 1) return json([]);
    if (seg[0] === 'qna' && seg.length === 1) return json([]);
    if (seg[0] === 'products' && seg[2] === 'specs') return json([]);
    if (seg[0] === 'wishlist' && seg[2] === 'count') return json(0);
    if (seg[0] === 'price-alerts' && seg[1] === 'product') return json([]);
    if (seg[0] === 'back-in-stock' && seg[1] === 'variant')
      return json({ subscribed: false, count: 0 });
    if (seg[0] === 'shipping' && seg[1] === 'methods') return json([]);

    return notFound(path);
  },
};
