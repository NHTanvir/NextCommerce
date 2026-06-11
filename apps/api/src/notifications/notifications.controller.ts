import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Sse,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationsBus } from './notifications.bus';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';
import { NotificationType } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly bus: NotificationsBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  findForUser(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findForUser(user.sub, limit ? Number(limit) : 30);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getUnreadCount(@CurrentUser() user: UserPayload) {
    return this.notificationsService.getUnreadCount(user.sub).then((count) => ({ count }));
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: UserPayload) {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.notificationsService.deleteNotification(id, user.sub);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all notifications for current user' })
  deleteAll(@CurrentUser() user: UserPayload) {
    return this.notificationsService.deleteAllForUser(user.sub);
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get notification statistics' })
  getAdminStats() {
    return this.notificationsService.getAdminStats();
  }

  @Post('admin/broadcast')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Broadcast notification to a list of users' })
  broadcast(
    @Body() dto: { userIds: string[]; type: NotificationType; title: string; body: string; actionUrl?: string },
  ) {
    return this.notificationsService
      .broadcastToUsers(dto.userIds, dto.type, dto.title, dto.body, dto.actionUrl)
      .then((sent) => ({ sent }));
  }
}
