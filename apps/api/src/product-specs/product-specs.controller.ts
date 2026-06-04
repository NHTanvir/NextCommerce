import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductSpecsService, CreateSpecDto } from './product-specs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('product-specs')
@Controller('products/:productId/specs')
export class ProductSpecsController {
  constructor(private readonly service: ProductSpecsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all specs for a product' })
  findAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.findForProduct(productId);
  }

  @Get('grouped')
  @ApiOperation({ summary: 'Get specs grouped by category' })
  findGrouped(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.findGrouped(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Set a product spec (upsert by key)' })
  setSpec(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateSpecDto,
  ) {
    return this.service.setSpec(productId, dto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Bulk set specs for a product' })
  bulkSet(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: { specs: CreateSpecDto[] },
  ) {
    return this.service.bulkSet(productId, dto.specs);
  }

  @Delete(':specId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete a product spec' })
  deleteSpec(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('specId', ParseUUIDPipe) specId: string,
  ) {
    return this.service.deleteSpec(specId, productId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete all specs for a product' })
  deleteAll(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.service.deleteAllForProduct(productId);
  }
}
