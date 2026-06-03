import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { EventsService } from '../events/events.service';

export interface StockAlert {
  variantId: string;
  productId: string;
  sku: string;
  currentStock: number;
  threshold: number;
  alertType: 'low_stock' | 'out_of_stock';
}

const DEFAULT_THRESHOLD = 5;

@Injectable()
export class InventoryAlertService {
  private readonly logger = new Logger(InventoryAlertService.name);

  constructor(
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
    private readonly eventsService: EventsService,
  ) {}

  async checkLowStock(threshold = DEFAULT_THRESHOLD): Promise<StockAlert[]> {
    const variants = await this.variantRepo.find({
      where: { stockQty: LessThanOrEqual(threshold) },
      relations: ['product'],
    });

    return variants.map((v) => ({
      variantId: v.id,
      productId: v.productId,
      sku: v.sku,
      currentStock: v.stockQty,
      threshold,
      alertType: v.stockQty === 0 ? 'out_of_stock' : 'low_stock',
    }));
  }

  async publishLowStockAlerts(threshold = DEFAULT_THRESHOLD): Promise<number> {
    const alerts = await this.checkLowStock(threshold);
    if (alerts.length === 0) return 0;

    this.logger.warn({ count: alerts.length }, 'Publishing low stock alerts');
    for (const alert of alerts) {
      await this.eventsService.publish('inventory.low_stock', alert);
    }
    return alerts.length;
  }

  async isVariantInStock(variantId: string): Promise<boolean> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) return false;
    return variant.stockQty > 0;
  }

  async getLowStockSummary(threshold = DEFAULT_THRESHOLD): Promise<{
    outOfStock: number;
    lowStock: number;
    healthy: number;
  }> {
    const [total, lowItems] = await Promise.all([
      this.variantRepo.count(),
      this.checkLowStock(threshold),
    ]);

    const outOfStock = lowItems.filter((a) => a.alertType === 'out_of_stock').length;
    const lowStock = lowItems.filter((a) => a.alertType === 'low_stock').length;

    return { outOfStock, lowStock, healthy: total - outOfStock - lowStock };
  }
}
