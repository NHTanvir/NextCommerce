import { Controller, Get, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary stats' })
  getSummary() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('revenue')
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiOperation({ summary: 'Get daily revenue for the last N days' })
  getRevenue(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.analyticsService.getRevenueByDay(Math.min(days, 365));
  }

  @Get('top-products')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get top selling products by quantity' })
  getTopProducts(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.analyticsService.getTopProducts(Math.min(limit, 50));
  }

  @Get('order-status')
  @ApiOperation({ summary: 'Get order counts and revenue grouped by status' })
  getOrderStatusBreakdown() {
    return this.analyticsService.getOrderStatusBreakdown();
  }

  @Get('new-customers')
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiOperation({ summary: 'Get new customer registrations per day for last N days' })
  getNewCustomers(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.analyticsService.getNewCustomersByDay(Math.min(days, 365));
  }

  @Get('repeat-customers')
  @ApiOperation({ summary: 'Get repeat customer rate and average orders per customer' })
  getRepeatCustomerRate() {
    return this.analyticsService.getRepeatCustomerRate();
  }

  @Get('revenue-by-category')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get revenue broken down by product category' })
  getRevenueByCategory(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.analyticsService.getRevenueByCategory(Math.min(limit, 50));
  }

  @Get('hourly-distribution')
  @ApiOperation({ summary: 'Get order volume and revenue by hour of day' })
  getHourlySalesDistribution() {
    return this.analyticsService.getHourlySalesDistribution();
  }
}
