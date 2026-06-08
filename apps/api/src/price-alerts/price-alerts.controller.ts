import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PriceAlertsService, CreatePriceAlertDto } from './price-alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

@ApiTags('price-alerts')
@Controller('price-alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PriceAlertsController {
  constructor(private readonly service: PriceAlertsService) {}

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get price alert statistics' })
  getAdminStats() {
    return this.service.getAdminStats();
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List all price alerts with pagination' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(page ? Number(page) : 1, limit ? Number(limit) : 30);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active price alerts for current user' })
  findForUser(@CurrentUser() user: UserPayload) {
    return this.service.findForUser(user.sub);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get alert status for a specific product' })
  getAlert(
    @CurrentUser() user: UserPayload,
    @Param('productId') productId: string,
  ) {
    return this.service.getAlert(user.sub, productId).then((alert) => ({
      hasAlert: !!alert,
      targetPriceCents: alert?.targetPriceCents ?? null,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Subscribe to a price alert for a product' })
  subscribe(@CurrentUser() user: UserPayload, @Body() dto: CreatePriceAlertDto) {
    return this.service.subscribe(user.sub, dto);
  }

  @Delete('product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsubscribe from a price alert' })
  unsubscribe(
    @CurrentUser() user: UserPayload,
    @Param('productId') productId: string,
  ) {
    return this.service.unsubscribe(user.sub, productId);
  }
}
