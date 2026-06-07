import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { Product } from '../catalog/entities/product.entity';
import {
  AdjustStockDto,
  SetStockDto,
  ProductInventory,
  VariantStockSummary,
  LOW_STOCK_THRESHOLD,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getProductInventory(productId: string): Promise<ProductInventory> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['variants'],
    });
    if (!product) throw new NotFoundException('Product not found');

    const variants: VariantStockSummary[] = (product.variants || []).map((v) => ({
      variantId: v.id,
      sku: v.sku,
      size: Number(v.size),
      color: v.color,
      stockQty: v.stockQty,
      priceCents: v.priceCents,
      isLowStock: v.stockQty <= LOW_STOCK_THRESHOLD,
    }));

    const totalStock = variants.reduce((sum, v) => sum + v.stockQty, 0);
    const lowStockCount = variants.filter((v) => v.isLowStock).length;

    return { productId, title: product.title, slug: product.slug, variants, totalStock, lowStockCount };
  }

  async adjustStock(variantId: string, dto: AdjustStockDto): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');

    const newQty = variant.stockQty + dto.delta;
    if (newQty < 0) {
      throw new BadRequestException(
        `Adjustment would result in negative stock (current: ${variant.stockQty}, delta: ${dto.delta})`,
      );
    }

    await this.variantRepo.update(variantId, { stockQty: newQty });
    return { ...variant, stockQty: newQty };
  }

  async setStock(variantId: string, dto: SetStockDto): Promise<ProductVariant> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');

    await this.variantRepo.update(variantId, { stockQty: dto.quantity });
    return { ...variant, stockQty: dto.quantity };
  }

  async getLowStockAlerts(threshold = LOW_STOCK_THRESHOLD): Promise<ProductVariant[]> {
    return this.variantRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.product', 'p')
      .where('v.stockQty <= :threshold', { threshold })
      .andWhere('p.isActive = :active', { active: true })
      .orderBy('v.stockQty', 'ASC')
      .getMany();
  }

  async getStockSummary(): Promise<{ totalVariants: number; totalStock: number; outOfStock: number; lowStock: number; inStock: number }> {
    const rows = await this.variantRepo
      .createQueryBuilder('v')
      .select('COUNT(v.id)', 'totalVariants')
      .addSelect('SUM(v.stockQty)', 'totalStock')
      .addSelect('SUM(CASE WHEN v.stockQty = 0 THEN 1 ELSE 0 END)', 'outOfStock')
      .addSelect(`SUM(CASE WHEN v.stockQty > 0 AND v.stockQty <= ${LOW_STOCK_THRESHOLD} THEN 1 ELSE 0 END)`, 'lowStock')
      .addSelect(`SUM(CASE WHEN v.stockQty > ${LOW_STOCK_THRESHOLD} THEN 1 ELSE 0 END)`, 'inStock')
      .getRawOne<{ totalVariants: string; totalStock: string; outOfStock: string; lowStock: string; inStock: string }>();

    return {
      totalVariants: parseInt(rows?.totalVariants ?? '0', 10),
      totalStock: parseInt(rows?.totalStock ?? '0', 10),
      outOfStock: parseInt(rows?.outOfStock ?? '0', 10),
      lowStock: parseInt(rows?.lowStock ?? '0', 10),
      inStock: parseInt(rows?.inStock ?? '0', 10),
    };
  }
}
