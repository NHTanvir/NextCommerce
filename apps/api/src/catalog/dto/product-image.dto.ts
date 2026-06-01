import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageDto {
  @ApiProperty() @IsString() url: string;
  @ApiProperty() @IsString() alt: string;
  @ApiPropertyOptional() @IsOptional() @IsString() width?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() height?: string;
}
