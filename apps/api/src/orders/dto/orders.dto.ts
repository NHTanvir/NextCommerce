import { IsUUID, IsString, IsEnum, IsOptional, IsInt, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@nextcommerce/shared';

export class CreateAddressDto {
  @ApiProperty() @IsString() @MinLength(5) line1: string;
  @ApiPropertyOptional() @IsOptional() @IsString() line2?: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() country: string;
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(20) postalCode: string;
}

export class CreateOrderDto {
  @ApiProperty() @IsUUID() cartId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() addressId?: string;
  @ApiPropertyOptional() @IsOptional() address?: CreateAddressDto;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['pending','paid','fulfilled','shipped','delivered','cancelled','refunded'] })
  @IsEnum(['pending','paid','fulfilled','shipped','delivered','cancelled','refunded'])
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Carrier tracking number (for shipped status)' })
  @IsOptional() @IsString() @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Shipping carrier (e.g. UPS, FedEx, USPS)' })
  @IsOptional() @IsString() @MaxLength(50)
  carrier?: string;
}

export class BulkFulfillDto {
  @ApiProperty({ type: [String] })
  orderIds: string[];

  @ApiProperty({ enum: ['fulfilled', 'shipped', 'delivered'] })
  @IsEnum(['fulfilled', 'shipped', 'delivered'])
  status: OrderStatus;
}
