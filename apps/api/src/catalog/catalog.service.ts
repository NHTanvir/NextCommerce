import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListResponse } from '@nextcommerce/shared';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async findAll(query: ProductQueryDto): Promise<ProductListResponse> {
    const { page, limit, categoryId, brand, search, color, size, minPrice, maxPrice } = query;

    if (color || size) {
      const qb = this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .innerJoinAndSelect('p.variants', 'v')
        .where('p.isActive = true');

      if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
      if (brand) qb.andWhere('p.brand = :brand', { brand });
      if (search) qb.andWhere('p.title LIKE :search', { search: `%${search}%` });
      if (minPrice !== undefined) qb.andWhere('p.basePriceCents >= :minPrice', { minPrice });
      if (maxPrice !== undefined) qb.andWhere('p.basePriceCents <= :maxPrice', { maxPrice });
      if (color) qb.andWhere('v.color = :color', { color });
      if (size) qb.andWhere('v.size = :size', { size });

      const all = await qb.orderBy('p.createdAt', 'DESC').getMany();
      const total = all.length;
      const data = all.slice((page - 1) * limit, page * limit);
      return {
        data: data.map((p) => CatalogService.toDto(p)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    const where: FindOptionsWhere<Product> = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (brand) where.brand = brand;
    if (search) where.title = Like(`%${search}%`);
    if (minPrice !== undefined && maxPrice !== undefined)
      where.basePriceCents = Between(minPrice, maxPrice);

    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'variants'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: data.map((p) => CatalogService.toDto(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: ['category', 'variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return CatalogService.toDto(product);
  }

  async findVariantById(id: string): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({ where: { id }, relations: ['product'] });
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }

  async findCategories() {
    return this.categoryRepo.find({
      where: { parentId: undefined },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }

  async getDeals(
    minDiscountPct = 0,
    limit = 20,
    page = 1,
  ): Promise<{
    data: ReturnType<typeof CatalogService.toDto>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.isActive = true')
      .andWhere('p.salePriceCents IS NOT NULL')
      .andWhere('p.salePriceCents < p.basePriceCents');

    const all = await qb.getMany();

    const withPct = all
      .map((p) => ({
        product: p,
        discountPct: p.salePriceCents
          ? Math.round(((p.basePriceCents - p.salePriceCents) / p.basePriceCents) * 100)
          : 0,
      }))
      .filter((x) => x.discountPct >= minDiscountPct)
      .sort((a, b) => b.discountPct - a.discountPct);

    const total = withPct.length;
    const slice = withPct.slice((page - 1) * limit, page * limit);

    return {
      data: slice.map(({ product }) => CatalogService.toDto(product)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      title: dto.title,
      description: dto.description,
      brand: dto.brand,
      slug: dto.slug,
      basePriceCents: dto.basePriceCents,
      salePriceCents: dto.salePriceCents ?? null,
      categoryId: dto.categoryId,
      images: dto.images || [],
      isActive: dto.isActive ?? true,
    });
    const saved = await this.productRepo.save(product);

    if (dto.variants?.length) {
      const variants = dto.variants.map((v) =>
        this.variantRepo.create({ ...v, productId: saved.id }),
      );
      await this.variantRepo.save(variants);
    }

    return this.productRepo.findOne({
      where: { id: saved.id },
      relations: ['category', 'variants'],
    }) as Promise<Product>;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    await this.productRepo.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.brand !== undefined && { brand: dto.brand }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.basePriceCents !== undefined && { basePriceCents: dto.basePriceCents }),
      ...(dto.salePriceCents !== undefined && { salePriceCents: dto.salePriceCents }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.images !== undefined && { images: dto.images }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return this.productRepo.findOne({
      where: { id },
      relations: ['category', 'variants'],
    }) as Promise<Product>;
  }

  async softDelete(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.update(id, { isActive: false });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'variants'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async decrementStock(variantId: string, qty: number) {
    await this.variantRepo.decrement({ id: variantId }, 'stockQty', qty);
  }

  async incrementStock(variantId: string, qty: number) {
    await this.variantRepo.increment({ id: variantId }, 'stockQty', qty);
  }

  async bulkUpdatePrices(
    updates: { productId: string; basePriceCents: number }[],
  ): Promise<{ updated: number; errors: string[] }> {
    let updated = 0;
    const errors: string[] = [];

    for (const { productId, basePriceCents } of updates) {
      try {
        const product = await this.productRepo.findOne({ where: { id: productId } });
        if (!product) {
          errors.push(`${productId}: not found`);
          continue;
        }
        await this.productRepo.update(productId, { basePriceCents });
        updated++;
      } catch (err: any) {
        errors.push(`${productId}: ${err.message}`);
      }
    }

    return { updated, errors };
  }

  async getBrands(): Promise<Array<{ brand: string; productCount: number }>> {
    const rows = await this.productRepo
      .createQueryBuilder('p')
      .select('p.brand', 'brand')
      .addSelect('COUNT(p.id)', 'productCount')
      .where('p.isActive = true')
      .andWhere('p.brand IS NOT NULL')
      .groupBy('p.brand')
      .orderBy('productCount', 'DESC')
      .getRawMany<{ brand: string; productCount: string }>();

    return rows.map((r) => ({
      brand: r.brand,
      productCount: Number(r.productCount),
    }));
  }

  async getRelated(productId: string, limit = 8) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const results = await this.productRepo
      .createQueryBuilder('p')
      .where('p.id != :id', { id: productId })
      .andWhere('p.isActive = true')
      .andWhere('(p.categoryId = :catId OR p.brand = :brand)', {
        catId: product.categoryId,
        brand: product.brand,
      })
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.variants', 'variants')
      .orderBy(
        'CASE WHEN p.categoryId = :catId AND p.brand = :brand THEN 0 WHEN p.brand = :brand THEN 1 ELSE 2 END',
      )
      .setParameter('catId', product.categoryId)
      .setParameter('brand', product.brand)
      .take(limit)
      .getMany();

    return results.map((p) => CatalogService.toDto(p));
  }

  async getTopSellers(limit = 8) {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.isActive = true')
      .orderBy('p.createdAt', 'DESC')
      .take(limit)
      .getMany();
    return products.map((p) => CatalogService.toDto(p));
  }

  async getVariantsForProduct(productId: string) {
    return this.variantRepo.find({
      where: { productId },
      order: { size: 'ASC' },
    });
  }

  async addVariant(
    productId: string,
    data: {
      size: number;
      color: string;
      sku: string;
      stockQty: number;
      priceCents: number;
    },
  ) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    const variant = this.variantRepo.create({ ...data, productId });
    return this.variantRepo.save(variant);
  }

  async updateVariant(
    variantId: string,
    data: Partial<{
      size: number;
      color: string;
      sku: string;
      stockQty: number;
      priceCents: number;
    }>,
  ) {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    await this.variantRepo.update(variantId, data);
    return this.variantRepo.findOne({ where: { id: variantId } });
  }

  async deleteVariant(variantId: string): Promise<void> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    await this.variantRepo.delete(variantId);
  }

  async bulkActivate(productIds: string[], isActive: boolean): Promise<{ updated: number }> {
    if (!productIds.length) return { updated: 0 };
    const result = await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ isActive })
      .whereInIds(productIds)
      .execute();
    return { updated: result.affected ?? 0 };
  }

  async getNewArrivals(days = 30, limit = 20) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.isActive = true')
      .andWhere('p.createdAt >= :since', { since })
      .orderBy('p.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return products.map((p) => CatalogService.toDto(p));
  }

  async getFeatured(limit = 12) {
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.variants', 'variants')
      .where('p.isActive = true')
      .andWhere('p.salePriceCents IS NOT NULL')
      .andWhere('p.salePriceCents < p.basePriceCents')
      .orderBy('RAND()')
      .take(limit)
      .getMany();

    if (products.length < limit) {
      const remaining = limit - products.length;
      const fallback = await this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.variants', 'variants')
        .where('p.isActive = true')
        .orderBy('RAND()')
        .take(remaining)
        .getMany();
      const existingIds = new Set(products.map((p) => p.id));
      products.push(...fallback.filter((p) => !existingIds.has(p.id)));
    }

    return products.map((p) => CatalogService.toDto(p));
  }

  async searchSuggestions(q: string, limit = 8) {
    if (!q || q.length < 2) return [];
    const products = await this.productRepo
      .createQueryBuilder('p')
      .where('p.isActive = true')
      .andWhere('(p.title LIKE :q OR p.brand LIKE :q)', { q: `%${q}%` })
      .select(['p.id', 'p.slug', 'p.title', 'p.brand', 'p.basePriceCents'])
      .take(limit)
      .getMany();

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      priceCents: p.basePriceCents,
    }));
  }

  async getCatalogHealth(): Promise<{
    total: number;
    active: number;
    noImages: number;
    noDescription: number;
    noVariants: number;
    outOfStock: number;
    missingCategory: number;
  }> {
    const [total, active] = await Promise.all([
      this.productRepo.count(),
      this.productRepo.count({ where: { isActive: true } }),
    ]);

    const [noImages, noDescription, noVariants, outOfStock, missingCategory] = await Promise.all([
      this.productRepo
        .createQueryBuilder('p')
        .leftJoin('p.images', 'img')
        .where('img.id IS NULL')
        .getCount(),
      this.productRepo
        .createQueryBuilder('p')
        .where('p.description IS NULL OR p.description = :empty', { empty: '' })
        .getCount(),
      this.productRepo
        .createQueryBuilder('p')
        .leftJoin('p.variants', 'v')
        .where('v.id IS NULL')
        .getCount(),
      this.productRepo
        .createQueryBuilder('p')
        .leftJoin('p.variants', 'v')
        .where('p.isActive = true')
        .groupBy('p.id')
        .having('COALESCE(SUM(v.stockQty), 0) = 0')
        .getCount(),
      this.productRepo.createQueryBuilder('p').where('p.categoryId IS NULL').getCount(),
    ]);

    return { total, active, noImages, noDescription, noVariants, outOfStock, missingCategory };
  }

  static toDto(p: Product) {
    const discountPct =
      p.salePriceCents && p.salePriceCents < p.basePriceCents
        ? Math.round(((p.basePriceCents - p.salePriceCents) / p.basePriceCents) * 100)
        : 0;

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      brand: p.brand,
      basePriceCents: p.basePriceCents,
      salePriceCents: p.salePriceCents ?? null,
      discountPct,
      categoryId: p.categoryId,
      categoryName: p.category?.name,
      category: p.category ?? null,
      images: p.images ?? [],
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        size: Number(v.size),
        color: v.color,
        sku: v.sku,
        stockQty: v.stockQty,
        priceCents: v.priceCents,
      })),
      isActive: p.isActive,
      createdAt: p.createdAt?.toISOString(),
    };
  }
}
