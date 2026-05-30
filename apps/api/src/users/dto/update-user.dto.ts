import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UserRole } from '@nextcommerce/shared';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional({ minimum: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ enum: ['customer', 'admin'] })
  @IsOptional()
  @IsEnum(['customer', 'admin'])
  role?: UserRole;
}
