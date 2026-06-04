import { Controller, Post, Delete, Body, Param, Get, Query, UseGuards, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

class SubscribeDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @Public()
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @Delete('unsubscribe/:token')
  @Public()
  @ApiOperation({ summary: 'Unsubscribe using token from email' })
  unsubscribe(@Param('token') token: string) {
    return this.newsletterService.unsubscribe(token);
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get active subscriber count' })
  getCount() {
    return this.newsletterService.getActiveCount();
  }

  @Get('subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all subscribers with pagination' })
  listSubscribers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.newsletterService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 50);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Export active subscriber emails as CSV' })
  async exportEmails(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const csv = await this.newsletterService.exportEmails();
    const buffer = Buffer.from(csv, 'utf-8');
    const filename = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    return new StreamableFile(buffer);
  }
}
