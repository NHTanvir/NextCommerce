import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GiftCardsService, CreateGiftCardDto, RedeemGiftCardDto } from './gift-cards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

@ApiTags('gift-cards')
@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Check gift card balance by code' })
  getBalance(@Query('code') code: string) {
    return this.giftCardsService.getBalance(code);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a new gift card' })
  purchase(@Body() dto: CreateGiftCardDto, @CurrentUser() user: UserPayload) {
    return this.giftCardsService.purchase(user.sub, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my purchased gift cards' })
  myCards(@CurrentUser() user: UserPayload) {
    return this.giftCardsService.findByUser(user.sub);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply a gift card to an order' })
  apply(
    @Body() dto: { code: string; orderAmountCents: number },
    @CurrentUser() user: UserPayload,
  ) {
    return this.giftCardsService.applyToOrder(dto.code, user.sub, dto.orderAmountCents);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all gift cards' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.giftCardsService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get gift card statistics' })
  getStats() {
    return this.giftCardsService.getStats();
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Deactivate a gift card' })
  deactivate(@Param('id') id: string) {
    return this.giftCardsService.deactivate(id);
  }
}
