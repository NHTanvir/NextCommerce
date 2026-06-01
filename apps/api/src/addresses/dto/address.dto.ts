import { IsString, IsOptional, MaxLength, MinLength, IsPostalCode } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @MinLength(5)
  line1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @MaxLength(2)
  countryCode: string;

  @ApiPropertyOptional({ example: '+1-555-555-5555' })
  @IsOptional()
  @IsString()
  phone?: string;
}
