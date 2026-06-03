import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Product } from './entities/product.entity';

export interface RecommendationResult {
  products: Array<{
    id: string;
    slug: string;
    title: string;
    brand: string;
    basePriceCents: number;
    imageUrl?: string;
    categoryName?: string;
    reason: 'same_brand' | 'same_category' | 'popular';
  }>;
}

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async getRelated(productId: string, limit = 8): Promise<RecommendationResult> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['category'],
    });

    if (!product) return { products: [] };

    const [sameBrand, sameCategory] = await Promise.all([
      this.productRepo.find({
        where: { brand: product.brand, isActive: true, id: Not(productId) },
        relations: ['category'],
        take: Math.ceil(limit / 2),
        order: { createdAt: 'DESC' },
      }),
      this.productRepo.find({
        where: { categoryId: product.categoryId, isActive: true, id: Not(productId) },
        relations: ['category'],
        take: Math.ceil(limit / 2),
        order: { createdAt: 'DESC' },
      }),
    ]);

    const seen = new Set<string>();
    const results: RecommendationResult['products'] = [];

    for (const p of sameBrand) {
      if (!seen.has(p.id) && results.length < limit) {
        seen.add(p.id);
        results.push({ ...this.toSlim(p), reason: 'same_brand' });
      }
    }

    for (const p of sameCategory) {
      if (!seen.has(p.id) && results.length < limit) {
        seen.add(p.id);
        results.push({ ...this.toSlim(p), reason: 'same_category' });
      }
    }

    if (results.length < limit) {
      const popular = await this.productRepo.find({
        where: { isActive: true, id: Not(productId) },
        relations: ['category'],
        take: limit - results.length,
        order: { updatedAt: 'DESC' },
      });
      for (const p of popular) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          results.push({ ...this.toSlim(p), reason: 'popular' });
        }
      }
    }

    return { products: results };
  }

  async getTrending(limit = 8): Promise<RecommendationResult> {
    const products = await this.productRepo.find({
      where: { isActive: true },
      relations: ['category'],
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    return {
      products: products.map((p) => ({ ...this.toSlim(p), reason: 'popular' as const })),
    };
  }

  private toSlim(p: Product) {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      basePriceCents: p.basePriceCents,
      imageUrl: p.images?.[0]?.url,
      categoryName: p.category?.name,
    };
  }
}
