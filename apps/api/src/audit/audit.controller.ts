import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuditAction } from './audit-log.entity';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] Get recent audit log entries' })
  findRecent(@Query('limit') limit?: string) {
    return this.auditService.findRecent(limit ? Math.min(Number(limit), 500) : 100);
  }

  @Get('user')
  @ApiOperation({ summary: '[Admin] Get audit logs for a specific user' })
  findByUser(@Query('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditService.findByUser(userId, limit ? Number(limit) : 50);
  }

  @Get('action')
  @ApiOperation({ summary: '[Admin] Get audit logs filtered by action' })
  findByAction(@Query('action') action: AuditAction, @Query('limit') limit?: string) {
    return this.auditService.findByAction(action, limit ? Number(limit) : 100);
  }
}
