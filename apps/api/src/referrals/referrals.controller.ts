import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

class ApplyCodeDto {
  @IsString()
  @Length(6, 20)
  code: string;
}

@ApiTags('referrals')
@Controller('referrals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReferralsController {
  constructor(private readonly service: ReferralsService) {}

  @Get('my-code')
  @ApiOperation({ summary: 'Get or create referral code for current user' })
  getCode(@CurrentUser() user: UserPayload) {
    return this.service.getOrCreateCode(user.sub);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get referral stats for current user' })
  getStats(@CurrentUser() user: UserPayload) {
    return this.service.getReferralStats(user.sub);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get referral history for current user' })
  getHistory(@CurrentUser() user: UserPayload) {
    return this.service.getReferralHistory(user.sub);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a referral code during registration' })
  applyCode(@CurrentUser() user: UserPayload, @Body() dto: ApplyCodeDto) {
    return this.service.applyReferralCode(user.sub, dto.code);
  }

  @Get('admin/overview')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get referral program overview' })
  adminOverview() {
    return this.service.getAdminOverview();
  }

  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List all referrals with pagination' })
  adminList(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.adminListReferrals(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }
}
