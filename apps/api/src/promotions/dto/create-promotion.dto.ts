import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { DiscountType } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['percentage', 'fixed'])
  discountType: DiscountType;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minimumOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  usageLimit?: number;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];
}
