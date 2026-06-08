import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';
import { IsInt, Min, IsString, MinLength } from 'class-validator';

class RedeemPointsDto {
  @IsInt() @Min(100) points: number;
}

class AwardBonusDto {
  @IsString() userId: string;
  @IsInt() @Min(1) points: number;
  @IsString() @MinLength(5) description: string;
}

@ApiTags('loyalty')
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get my loyalty points balance and tier' })
  getBalance(@CurrentUser() user: UserPayload) {
    return this.loyaltyService.getBalance(user.sub);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get my loyalty transaction history' })
  getHistory(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
  ) {
    return this.loyaltyService.getTransactionHistory(user.sub, limit ? Number(limit) : 20);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem points for a discount' })
  redeem(@Body() dto: RedeemPointsDto, @CurrentUser() user: UserPayload) {
    return this.loyaltyService.redeemPoints(user.sub, dto.points);
  }

  @Post('admin/award')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Award bonus points to a user' })
  awardBonus(@Body() dto: AwardBonusDto) {
    return this.loyaltyService.awardBonus(dto.userId, dto.points, dto.description);
  }

  @Get('admin/accounts')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List all loyalty accounts sorted by lifetime points' })
  listAccounts(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.loyaltyService.listAccounts(page ? Number(page) : 1, limit ? Number(limit) : 30);
  }

  @Get('admin/tier-breakdown')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get loyalty tier distribution' })
  getTierBreakdown() {
    return this.loyaltyService.getTierBreakdown();
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get overall loyalty program statistics' })
  getAdminStats() {
    return this.loyaltyService.getAdminStats();
  }
}
