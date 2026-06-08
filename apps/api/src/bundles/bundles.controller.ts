import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BundlesService, CreateBundleDto } from './bundles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('bundles')
@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active product bundles' })
  findActive() {
    return this.bundlesService.findActive();
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get bundle statistics' })
  getStats() {
    return this.bundlesService.getStats();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all bundles including inactive' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.bundlesService.findAll(includeInactive === 'true');
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get bundles that include a specific product' })
  findForProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.bundlesService.findBundlesForProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bundle by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bundlesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a product bundle' })
  create(@Body() dto: CreateBundleDto) {
    return this.bundlesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update a bundle' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateBundleDto>,
  ) {
    return this.bundlesService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Deactivate a bundle' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.bundlesService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Delete a bundle' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bundlesService.remove(id);
  }
}
