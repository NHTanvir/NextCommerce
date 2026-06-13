import { Controller, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { NotificationPreferencesService } from './notification-preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserPayload } from '@nextcommerce/shared';

class UpdatePreferencesDto {
  @IsOptional() @IsBoolean() orderUpdates?: boolean;
  @IsOptional() @IsBoolean() promotionalEmails?: boolean;
  @IsOptional() @IsBoolean() lowStockAlerts?: boolean;
  @IsOptional() @IsBoolean() newsletterDigest?: boolean;
  @IsOptional() @IsBoolean() pushNotifications?: boolean;
  @IsOptional() @IsBoolean() smsAlerts?: boolean;
}

@ApiTags('notification-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly service: NotificationPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notification preferences' })
  get(@CurrentUser() user: UserPayload) {
    return this.service.getPreferences(user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Update my notification preferences' })
  update(@CurrentUser() user: UserPayload, @Body() dto: UpdatePreferencesDto) {
    return this.service.updatePreferences(user.sub, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Reset notification preferences to defaults' })
  reset(@CurrentUser() user: UserPayload) {
    return this.service.resetToDefaults(user.sub);
  }
}
