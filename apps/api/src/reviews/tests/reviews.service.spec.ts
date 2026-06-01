import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { ReviewsService, CreateReviewDto } from '../reviews.service';
import { Review } from '../entities/review.entity';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const reviewDto: CreateReviewDto = {
  productId: 'prod-1',
  rating: 4,
  title: 'Great shoe!',
  body: 'Very comfortable and stylish.',
};

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a review for a new user-product pair', async () => {
      const savedReview = { id: 'r1', ...reviewDto, userId: 'user-1' };
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(savedReview);
      mockRepo.save.mockResolvedValue(savedReview);

      const result = await service.create('user-1', reviewDto);

      expect(mockRepo.create).toHaveBeenCalledWith({ ...reviewDto, userId: 'user-1' });
      expect(result).toEqual(savedReview);
    });

    it('throws ConflictException if user already reviewed the product', async () => {
      const existing = { id: 'r1', productId: 'prod-1', userId: 'user-1' };
      mockRepo.findOne.mockResolvedValue(existing);

      await expect(service.create('user-1', reviewDto)).rejects.toThrow(ConflictException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findByProduct', () => {
    it('returns reviews ordered by createdAt DESC', async () => {
      const reviews = [{ id: 'r2' }, { id: 'r1' }];
      mockRepo.find.mockResolvedValue(reviews);

      const result = await service.findByProduct('prod-1');

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: 'prod-1' },
          order: { createdAt: 'DESC' },
        }),
      );
      expect(result).toEqual(reviews);
    });
  });

  describe('getAverageRating', () => {
    it('returns avg and count from query builder', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: '4.25', count: '8' }),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAverageRating('prod-1');

      expect(result).toEqual({ avg: 4.25, count: 8 });
    });

    it('handles empty result gracefully', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: null, count: '0' }),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAverageRating('prod-no-reviews');

      expect(result).toEqual({ avg: 0, count: 0 });
    });
  });
});
