import { IsString, IsInt, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty() @IsUUID() variantId: string;
  @ApiProperty({ default: 1 }) @IsInt() @Min(1) quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 0 }) @IsInt() @Min(0) quantity: number;
}

export class MergeCartDto {
  @ApiPropertyOptional() @IsOptional() @IsString() anonymousToken?: string;
}
