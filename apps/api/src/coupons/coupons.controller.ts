import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CouponsService, BulkGenerateCouponsDto } from './coupons.service';
import { CreateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

class BulkGenerateDto implements BulkGenerateCouponsDto {
  @IsInt() @Min(1) @Max(500) count: number;
  @IsOptional() @IsString() @MaxLength(16) prefix?: string;
  @IsEnum(['percentage', 'fixed']) discountType: 'percentage' | 'fixed';
  @IsInt() @Min(1) discountValue: number;
  @IsOptional() @IsInt() @Min(0) minOrderCents?: number;
  @IsOptional() @IsInt() @Min(1) maxUsagePerCode?: number;
  @IsOptional() @IsString() expiresAt?: string;
}

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @Public()
  @ApiOperation({ summary: 'Validate a coupon code against an order total' })
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto.code, dto.orderTotalCents);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a new coupon' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Post('admin/bulk-generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Bulk generate unique coupon codes' })
  bulkGenerate(@Body() dto: BulkGenerateDto) {
    return this.couponsService.bulkGenerate(dto);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get coupon usage statistics' })
  getStats() {
    return this.couponsService.getStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all coupons' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Deactivate a coupon' })
  deactivate(@Param('id') id: string) {
    return this.couponsService.deactivate(id);
  }
}
