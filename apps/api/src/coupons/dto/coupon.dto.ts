import { IsString, IsEnum, IsInt, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @MaxLength(32)
  code: string;

  @ApiProperty({ enum: ['percentage', 'fixed'] })
  @IsEnum(['percentage', 'fixed'])
  discountType: DiscountType;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  discountValue: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minOrderCents?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsageCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  orderTotalCents: number;
}
