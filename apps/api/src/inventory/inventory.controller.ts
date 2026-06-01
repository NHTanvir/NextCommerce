import {
  Controller,
  Get,
  Patch,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustStockDto, SetStockDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products/:productId')
  @ApiOperation({ summary: '[Admin] Get inventory overview for a product' })
  getProductInventory(@Param('productId') productId: string) {
    return this.inventoryService.getProductInventory(productId);
  }

  @Get('alerts')
  @ApiOperation({ summary: '[Admin] Get low-stock variant alerts' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  getLowStockAlerts(@Query('threshold') threshold?: string) {
    return this.inventoryService.getLowStockAlerts(threshold ? Number(threshold) : undefined);
  }

  @Patch('variants/:id/adjust')
  @ApiOperation({ summary: '[Admin] Adjust variant stock by delta (+/-)' })
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Put('variants/:id/stock')
  @ApiOperation({ summary: '[Admin] Set variant stock to absolute value' })
  setStock(@Param('id') id: string, @Body() dto: SetStockDto) {
    return this.inventoryService.setStock(id, dto);
  }
}
