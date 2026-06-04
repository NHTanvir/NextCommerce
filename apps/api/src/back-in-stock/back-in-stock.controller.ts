import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { BackInStockService } from './back-in-stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

class SubscribeDto {
  @IsUUID()
  variantId: string;

  @IsUUID()
  productId: string;
}

@ApiTags('back-in-stock')
@Controller('back-in-stock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BackInStockController {
  constructor(private readonly service: BackInStockService) {}

  @Get()
  @ApiOperation({ summary: 'Get pending back-in-stock subscriptions for current user' })
  findForUser(@CurrentUser() user: UserPayload) {
    return this.service.findForUser(user.sub);
  }

  @Get('variant/:variantId/status')
  @ApiOperation({ summary: 'Check if user is subscribed for a variant' })
  getStatus(
    @CurrentUser() user: UserPayload,
    @Param('variantId') variantId: string,
  ) {
    return this.service.hasSubscription(user.sub, variantId).then((subscribed) => ({ subscribed }));
  }

  @Post()
  @ApiOperation({ summary: 'Subscribe to back-in-stock alert for a variant' })
  subscribe(@CurrentUser() user: UserPayload, @Body() dto: SubscribeDto) {
    return this.service.subscribe(user.sub, dto.variantId, dto.productId);
  }

  @Delete('variant/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsubscribe from back-in-stock alert' })
  unsubscribe(
    @CurrentUser() user: UserPayload,
    @Param('variantId') variantId: string,
  ) {
    return this.service.unsubscribe(user.sub, variantId);
  }
}
