import { Controller, Get, Post, Delete, Patch, Body, Query, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService, CreateReviewDto } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
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

  @Get('distribution')
  @ApiOperation({ summary: 'Get rating distribution for a product' })
  getRatingDistribution(@Query('productId') productId: string) {
    return this.reviewsService.getRatingDistribution(productId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all reviews with pagination' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.reviewsService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a product review' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: UserPayload) {
    return this.reviewsService.create(user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own review (admin can delete any)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserPayload) {
    const isAdmin = user.role === 'admin';
    return this.reviewsService.deleteReview(id, user.sub, isAdmin);
  }

  @Patch(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote a review as helpful or not helpful' })
  vote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isHelpful') isHelpful: boolean,
    @CurrentUser() user: UserPayload,
  ) {
    return this.reviewsService.voteHelpful(id, user.sub, isHelpful);
  }

  @Get(':id/votes')
  @ApiOperation({ summary: 'Get vote counts for a review' })
  getVotes(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.getVoteCounts(id);
  }
}
