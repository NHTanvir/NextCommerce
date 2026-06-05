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
    const { page, limit, categoryId, brand, search, minPrice, maxPrice } = query;

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
      data: data.map((p) => this.toDto(p)),
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
    return this.toDto(product);
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

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      title: dto.title,
      description: dto.description,
      brand: dto.brand,
      slug: dto.slug,
      basePriceCents: dto.basePriceCents,
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
      .orderBy('CASE WHEN p.categoryId = :catId AND p.brand = :brand THEN 0 WHEN p.brand = :brand THEN 1 ELSE 2 END')
      .setParameter('catId', product.categoryId)
      .setParameter('brand', product.brand)
      .take(limit)
      .getMany();

    return results.map((p) => this.toDto(p));
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
    return products.map((p) => this.toDto(p));
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

  private toDto(p: Product) {
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      brand: p.brand,
      basePriceCents: p.basePriceCents,
      categoryId: p.categoryId,
      categoryName: p.category?.name,
      images: p.images,
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
