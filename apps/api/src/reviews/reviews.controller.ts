import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService, CreateReviewDto } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get reviews for a product' })
  findByProduct(@Query('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a product review' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: UserPayload) {
    return this.reviewsService.create(user.sub, dto);
  }
}
