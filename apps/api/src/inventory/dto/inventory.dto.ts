import { IsInt, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({ description: 'Delta to add (positive) or subtract (negative)' })
  @IsInt()
  delta: number;
}

export class SetStockDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  quantity: number;
}

export interface VariantStockSummary {
  variantId: string;
  sku: string;
  size: number;
  color: string;
  stockQty: number;
  priceCents: number;
  isLowStock: boolean;
}

export interface ProductInventory {
  productId: string;
  title: string;
  slug: string;
  variants: VariantStockSummary[];
  totalStock: number;
  lowStockCount: number;
}

export const LOW_STOCK_THRESHOLD = 5;
