import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { ReviewVote } from './entities/review-vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewVote])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
