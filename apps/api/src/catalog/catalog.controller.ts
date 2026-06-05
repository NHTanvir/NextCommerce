import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { IsArray, IsBoolean, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CatalogService } from './catalog.service';
import { CatalogImportService } from './catalog-import.service';
import { RecommendationsService } from './recommendations.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class PriceUpdateItem {
  @IsUUID() productId: string;
  @IsInt() @Min(1) basePriceCents: number;
}

class BulkPriceUpdateDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => PriceUpdateItem)
  updates: PriceUpdateItem[];
}

class BulkActivateDto {
  @IsArray() productIds: string[];
  @IsBoolean() isActive: boolean;
}

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly importService: CatalogImportService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'List products with optional filters and pagination' })
  findAll(@Query() query: ProductQueryDto) {
    return this.catalogService.findAll(query);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get single product by slug' })
  @ApiParam({ name: 'slug', example: 'nike-air-max-270' })
  findOne(@Param('slug') slug: string) {
    return this.catalogService.findBySlug(slug);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories with nested children' })
  getCategories() {
    return this.catalogService.findCategories();
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a new product' })
  create(@Body() dto: CreateProductDto) {
    return this.catalogService.create(dto);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.update(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Soft-delete product (sets isActive=false)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  remove(@Param('id') id: string) {
    return this.catalogService.softDelete(id);
  }

  @Get('products/id/:id')
  @ApiOperation({ summary: 'Get product by UUID (for admin use)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  findById(@Param('id') id: string) {
    return this.catalogService.findById(id);
  }

  @Get('products/:id/related')
  @ApiOperation({ summary: 'Get related product recommendations' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  getRelated(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.recommendationsService.getRelated(id, limit ? parseInt(limit, 10) : 8);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending products' })
  getTrending(@Query('limit') limit?: string) {
    return this.recommendationsService.getTrending(limit ? parseInt(limit, 10) : 8);
  }

  @Patch('products/bulk-price')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Bulk update product base prices' })
  bulkUpdatePrices(@Body() dto: BulkPriceUpdateDto) {
    return this.catalogService.bulkUpdatePrices(dto.updates);
  }

  @Patch('products/bulk-activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Bulk activate or deactivate products' })
  bulkActivate(@Body() dto: BulkActivateDto) {
    return this.catalogService.bulkActivate(dto.productIds, dto.isActive);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiConsumes('text/csv')
  @ApiOperation({ summary: '[Admin] Bulk import products from CSV' })
  async importCsv(@Req() req: Request) {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => resolve());
      req.on('error', reject);
    });
    const csvText = Buffer.concat(chunks).toString('utf-8');
    if (!csvText.trim()) throw new BadRequestException('CSV body is required');
    const rows = this.importService.parseCsv(csvText);
    return this.importService.importRows(rows);
  }
}
