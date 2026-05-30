import {
  IsString,
  IsInt,
  IsArray,
  IsUUID,
  IsBoolean,
  IsOptional,
  Min,
  MinLength,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ProductImageDto {
  @IsString() url: string;
  @IsString() alt: string;
}

class CreateVariantDto {
  @IsNumber() size: number;
  @IsString() color: string;
  @IsString() sku: string;
  @IsInt() @Min(0) stockQty: number;
  @IsInt() @Min(1) priceCents: number;
}

export class CreateProductDto {
  @ApiProperty() @IsString() @MinLength(2) title: string;
  @ApiProperty() @IsString() @MinLength(10) description: string;
  @ApiProperty() @IsString() brand: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty() @IsInt() @Min(1) basePriceCents: number;
  @ApiProperty() @IsUUID() categoryId: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductImageDto) images?: ProductImageDto[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateVariantDto) variants?: CreateVariantDto[];
}
