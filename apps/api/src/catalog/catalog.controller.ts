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
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { IsOptional, IsString, IsNumber, IsArray, IsBoolean, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
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

class CreateVariantDto {
  @IsNumber() size: number;
  @IsString() color: string;
  @IsString() sku: string;
  @IsInt() @Min(0) stockQty: number;
  @IsInt() @Min(1) priceCents: number;
}

class UpdateVariantDto {
  @IsOptional() @IsNumber() size?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsInt() @Min(0) stockQty?: number;
  @IsOptional() @IsInt() @Min(1) priceCents?: number;
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

  @Get('brands')
  @ApiOperation({ summary: 'Get all brands with product counts' })
  getBrands() {
    return this.catalogService.getBrands();
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

  @Get('deals')
  @ApiOperation({ summary: 'Get products on sale, sorted by discount percentage' })
  getDeals(
    @Query('minDiscount') minDiscount?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.catalogService.getDeals(
      minDiscount ? parseInt(minDiscount, 10) : 0,
      limit ? parseInt(limit, 10) : 20,
      page ? parseInt(page, 10) : 1,
    );
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Get recently added products' })
  getNewArrivals(
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    return this.catalogService.getNewArrivals(
      days ? parseInt(days, 10) : 30,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products (sale items + fallback)' })
  getFeatured(@Query('limit') limit?: string) {
    return this.catalogService.getFeatured(limit ? parseInt(limit, 10) : 12);
  }

  @Get('search/suggestions')
  @ApiOperation({ summary: 'Get typeahead search suggestions' })
  getSearchSuggestions(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    return this.catalogService.searchSuggestions(q, limit ? parseInt(limit, 10) : 8);
  }

  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get catalog health stats (missing images, descriptions, variants)' })
  getCatalogHealth() {
    return this.catalogService.getCatalogHealth();
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

  @Get('products/:id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all variants for a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  getVariants(@Param('id') id: string) {
    return this.catalogService.getVariantsForProduct(id);
  }

  @Post('products/:id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Add a new variant to a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.catalogService.addVariant(id, dto);
  }

  @Patch('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update a product variant' })
  @ApiParam({ name: 'variantId', description: 'Variant UUID' })
  updateVariant(@Param('variantId') variantId: string, @Body() dto: UpdateVariantDto) {
    return this.catalogService.updateVariant(variantId, dto);
  }

  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete a product variant' })
  @ApiParam({ name: 'variantId', description: 'Variant UUID' })
  deleteVariant(@Param('variantId') variantId: string) {
    return this.catalogService.deleteVariant(variantId);
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

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Export all products as CSV' })
  async exportCsv(@Res() res: Response) {
    const result = await this.catalogService.getProducts({ page: 1, limit: 10000 });
    const products = result.data;

    const headers = ['id', 'title', 'slug', 'brand', 'description', 'basePriceCents', 'salePriceCents', 'categoryId', 'isActive', 'imageUrl', 'createdAt'];

    const rows = products.map((p: any) => [
      p.id,
      `"${(p.title ?? '').replace(/"/g, '""')}"`,
      p.slug,
      `"${(p.brand ?? '').replace(/"/g, '""')}"`,
      `"${(p.description ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      p.basePriceCents,
      p.salePriceCents ?? '',
      p.categoryId ?? '',
      p.isActive ? 'true' : 'false',
      p.images?.[0]?.url ?? '',
      p.createdAt ?? '',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
    res.send(csv);
  }
}
