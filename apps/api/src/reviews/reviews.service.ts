import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { IsString, IsInt, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString() productId: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsString() @MinLength(3) title: string;
  @IsString() @MinLength(10) body: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const existing = await this.reviewRepo.findOne({
      where: { productId: dto.productId, userId },
    });
    if (existing) throw new ConflictException('You have already reviewed this product');

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

  async getAverageRating(productId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.productId = :productId', { productId })
      .getRawOne();
    return { avg: parseFloat(result?.avg || '0'), count: parseInt(result?.count || '0') };
  }
}
