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
import { InventoryAlertService } from './inventory-alert.service';
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
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly alertService: InventoryAlertService,
  ) {}

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

  @Get('alerts/summary')
  @ApiOperation({ summary: '[Admin] Get stock health summary (out/low/healthy counts)' })
  getAlertSummary(@Query('threshold') threshold?: string) {
    return this.alertService.getLowStockSummary(threshold ? Number(threshold) : undefined);
  }

  @Patch('alerts/publish')
  @ApiOperation({ summary: '[Admin] Publish low-stock events to message broker' })
  publishAlerts(@Query('threshold') threshold?: string) {
    return this.alertService.publishLowStockAlerts(threshold ? Number(threshold) : undefined)
      .then((count) => ({ published: count }));
  }

  @Get('summary')
  @ApiOperation({ summary: '[Admin] Get overall stock summary across all variants' })
  getStockSummary() {
    return this.inventoryService.getStockSummary();
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
