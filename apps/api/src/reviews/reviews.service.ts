import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewVote } from './entities/review-vote.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { IsString, IsInt, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString() productId: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsString() @MinLength(3) title: string;
  @IsString() @MinLength(10) body: string;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(ReviewVote) private readonly voteRepo: Repository<ReviewVote>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  private async hasUserReceivedProduct(userId: string, productId: string): Promise<boolean> {
    const row = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .innerJoin('oi.variant', 'pv')
      .where('o.userId = :userId', { userId })
      .andWhere('o.status = :status', { status: 'delivered' })
      .andWhere('pv.productId = :productId', { productId })
      .limit(1)
      .getRawOne();
    return !!row;
  }

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const existing = await this.reviewRepo.findOne({
      where: { productId: dto.productId, userId },
    });
    if (existing) throw new ConflictException('You have already reviewed this product');

    const eligible = await this.hasUserReceivedProduct(userId, dto.productId);
    if (!eligible) {
      throw new ForbiddenException(
        'You can only review products from a delivered order',
      );
    }

    const review = this.reviewRepo.create({ ...dto, userId });
    return this.reviewRepo.save(review);
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(productId: string): Promise<{ avg: number; count: number }> {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.productId = :productId', { productId })
      .getRawOne();
    return { avg: parseFloat(result?.avg || '0'), count: parseInt(result?.count || '0') };
  }

  async getRatingDistribution(productId: string): Promise<RatingDistribution> {
    const rows = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.productId = :productId', { productId })
      .groupBy('r.rating')
      .getRawMany<{ rating: string; count: string }>();

    const dist: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rows) {
      const r = parseInt(row.rating) as 1 | 2 | 3 | 4 | 5;
      dist[r] = parseInt(row.count);
    }
    return dist;
  }

  async deleteReview(reviewId: string, userId: string, isAdmin = false): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (!isAdmin && review.userId !== userId) throw new ForbiddenException('Not your review');
    await this.reviewRepo.remove(review);
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Review[]; total: number }> {
    const [data, total] = await this.reviewRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async voteHelpful(reviewId: string, userId: string, isHelpful: boolean): Promise<{ helpfulCount: number; notHelpfulCount: number }> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found.');

    const existing = await this.voteRepo.findOne({ where: { reviewId, userId } });
    if (existing) {
      await this.voteRepo.update(existing.id, { isHelpful });
    } else {
      const vote = this.voteRepo.create({ reviewId, userId, isHelpful });
      await this.voteRepo.save(vote);
    }

    return this.getVoteCounts(reviewId);
  }

  async getVoteCounts(reviewId: string): Promise<{ helpfulCount: number; notHelpfulCount: number }> {
    const [helpfulCount, notHelpfulCount] = await Promise.all([
      this.voteRepo.count({ where: { reviewId, isHelpful: true } }),
      this.voteRepo.count({ where: { reviewId, isHelpful: false } }),
    ]);
    return { helpfulCount, notHelpfulCount };
  }

  async getUserVote(reviewId: string, userId: string): Promise<boolean | null> {
    const vote = await this.voteRepo.findOne({ where: { reviewId, userId } });
    return vote ? vote.isHelpful : null;
  }

  async getAdminStats(): Promise<{
    total: number;
    avgRating: number;
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  }> {
    const row = await this.reviewRepo
      .createQueryBuilder('r')
      .select('COUNT(*)', 'total')
      .addSelect('AVG(r.rating)', 'avgRating')
      .addSelect('SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END)', 'fiveStars')
      .addSelect('SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END)', 'fourStars')
      .addSelect('SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END)', 'threeStars')
      .addSelect('SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END)', 'twoStars')
      .addSelect('SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END)', 'oneStar')
      .getRawOne();
    return {
      total: Number(row.total) || 0,
      avgRating: Math.round((parseFloat(row.avgRating) || 0) * 10) / 10,
      fiveStars: Number(row.fiveStars) || 0,
      fourStars: Number(row.fourStars) || 0,
      threeStars: Number(row.threeStars) || 0,
      twoStars: Number(row.twoStars) || 0,
      oneStar: Number(row.oneStar) || 0,
    };
  }

  async getTopReviewedProducts(limit = 10): Promise<Array<{ productId: string; reviewCount: number; avgRating: number }>> {
    const rows = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.productId', 'productId')
      .addSelect('COUNT(r.id)', 'reviewCount')
      .addSelect('AVG(r.rating)', 'avgRating')
      .groupBy('r.productId')
      .orderBy('COUNT(r.id)', 'DESC')
      .limit(limit)
      .getRawMany<{ productId: string; reviewCount: string; avgRating: string }>();

    return rows.map((r) => ({
      productId: r.productId,
      reviewCount: parseInt(r.reviewCount, 10),
      avgRating: Math.round(parseFloat(r.avgRating) * 10) / 10,
    }));
  }
}
