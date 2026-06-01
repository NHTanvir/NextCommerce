import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OrderStatus } from '@nextcommerce/shared';

export class CreateOrderDto {
  @ApiProperty() @IsString() addressLine1!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine2?: string;
  @ApiProperty() @IsString() city!: string;
  @ApiProperty() @IsString() country!: string;
  @ApiProperty() @IsString() postalCode!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() anonymousToken?: string;
}

export class AdminUpdateOrderStatusDto {
  @ApiProperty()
  @IsEnum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status!: OrderStatus;
}
