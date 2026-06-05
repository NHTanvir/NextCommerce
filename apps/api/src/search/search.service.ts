import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../catalog/entities/product.entity';
import { Category } from '../catalog/entities/category.entity';

export interface SearchResultItem {
  type: 'product' | 'category';
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  brand?: string;
  basePriceCents?: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
  ) {}

  async search(query: string, limit = 20): Promise<SearchResponse> {
    const q = query.trim();
    if (!q) return { query: '', total: 0, results: [] };

    const [products, categories] = await Promise.all([
      this.searchProducts(q, limit),
      this.searchCategories(q, 5),
    ]);

    const results: SearchResultItem[] = [
      ...categories,
      ...products,
    ].slice(0, limit);

    return { query: q, total: results.length, results };
  }

  private async searchProducts(q: string, limit: number): Promise<SearchResultItem[]> {
    const rows = await this.productRepo
      .createQueryBuilder('p')
      .select([
        'p.id', 'p.slug', 'p.title', 'p.brand', 'p.basePriceCents', 'p.images',
      ])
      .where('p.isActive = 1')
      .andWhere(
        '(p.title LIKE :q OR p.brand LIKE :q OR p.description LIKE :q)',
        { q: `%${q}%` },
      )
      .orderBy('p.basePriceCents', 'ASC')
      .take(limit)
      .getMany();

    return rows.map((p) => ({
      type: 'product' as const,
      id: p.id,
      title: p.title,
      slug: p.slug,
      brand: p.brand,
      basePriceCents: p.basePriceCents,
      imageUrl: p.images?.[0]?.url,
    }));
  }

  private async searchCategories(q: string, limit: number): Promise<SearchResultItem[]> {
    const rows = await this.categoryRepo
      .createQueryBuilder('c')
      .select(['c.id', 'c.name', 'c.slug', 'c.imageUrl'])
      .where('c.name LIKE :q', { q: `%${q}%` })
      .take(limit)
      .getMany();

    return rows.map((c) => ({
      type: 'category' as const,
      id: c.id,
      title: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl ?? undefined,
    }));
  }

  async autocomplete(query: string): Promise<string[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const rows = await this.productRepo
      .createQueryBuilder('p')
      .select('DISTINCT p.title', 'title')
      .addSelect('p.brand', 'brand')
      .where('p.isActive = 1')
      .andWhere('(p.title LIKE :q OR p.brand LIKE :q)', { q: `${q}%` })
      .orderBy('p.title', 'ASC')
      .limit(8)
      .getRawMany<{ title: string; brand: string }>();

    const suggestions = new Set<string>();
    for (const row of rows) {
      suggestions.add(row.title);
      if (row.brand.toLowerCase().startsWith(q.toLowerCase())) {
        suggestions.add(row.brand);
      }
    }
    return [...suggestions].slice(0, 8);
  }

  async getTrendingSearches(limit = 8): Promise<{ term: string; category: string }[]> {
    const brands = await this.productRepo
      .createQueryBuilder('p')
      .select('p.brand', 'brand')
      .where('p.isActive = 1')
      .andWhere('p.brand IS NOT NULL')
      .andWhere("p.brand != ''")
      .groupBy('p.brand')
      .orderBy('COUNT(p.id)', 'DESC')
      .limit(Math.ceil(limit / 2))
      .getRawMany<{ brand: string }>();

    const categories = await this.categoryRepo
      .createQueryBuilder('c')
      .select(['c.name', 'c.slug'])
      .limit(Math.floor(limit / 2))
      .getMany();

    const results: { term: string; category: string }[] = [
      ...brands.map((b) => ({ term: b.brand, category: 'brand' })),
      ...categories.map((c) => ({ term: c.name, category: 'category' })),
    ];

    return results.slice(0, limit);
  }

  async searchByBrand(brand: string, limit = 20): Promise<SearchResponse> {
    const rows = await this.productRepo
      .createQueryBuilder('p')
      .select(['p.id', 'p.slug', 'p.title', 'p.brand', 'p.basePriceCents', 'p.images'])
      .where('p.isActive = 1')
      .andWhere('p.brand LIKE :brand', { brand: `%${brand}%` })
      .orderBy('p.basePriceCents', 'ASC')
      .take(limit)
      .getMany();

    const results: SearchResultItem[] = rows.map((p) => ({
      type: 'product' as const,
      id: p.id,
      title: p.title,
      slug: p.slug,
      brand: p.brand,
      basePriceCents: p.basePriceCents,
      imageUrl: p.images?.[0]?.url,
    }));

    return { query: brand, total: results.length, results };
  }
}
