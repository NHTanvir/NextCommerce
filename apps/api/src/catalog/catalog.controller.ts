import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

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
}
