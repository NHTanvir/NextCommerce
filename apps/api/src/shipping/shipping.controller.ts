import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('rates')
  @Public()
  @ApiOperation({ summary: 'Get available shipping rates for an order total' })
  @ApiQuery({ name: 'total', required: true, description: 'Order total in cents' })
  @ApiQuery({ name: 'country', required: false, description: 'Destination country code' })
  getRates(
    @Query('total') total: string,
    @Query('country') country = 'US',
  ) {
    return this.shippingService.getEstimate(Number(total), country);
  }

  @Get('delivery-date')
  @Public()
  @ApiOperation({ summary: 'Get estimated delivery date for a shipping rate' })
  @ApiQuery({ name: 'rateId', required: true })
  getDeliveryDate(@Query('rateId') rateId: string) {
    const date = this.shippingService.calculateDeliveryDate(rateId);
    return { rateId, estimatedDelivery: date.toISOString() };
  }
}
