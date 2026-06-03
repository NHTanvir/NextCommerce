import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, BulkFulfillDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserPayload } from '@nextcommerce/shared';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from current cart' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: UserPayload) {
    return this.ordersService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my order history' })
  findAll(@CurrentUser() user: UserPayload) {
    return this.ordersService.findByUser(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order' })
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Update order status with optional tracking' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ordersService.updateStatus(id, dto.status, user.sub, dto.trackingNumber, dto.carrier);
  }

  @Post('admin/bulk-fulfill')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Bulk update order statuses' })
  bulkFulfill(@Body() dto: BulkFulfillDto, @CurrentUser() user: UserPayload) {
    return this.ordersService.bulkFulfill(dto, user.sub);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List all orders with pagination' })
  findAllAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.ordersService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }
}
