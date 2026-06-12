import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReviewsService, CreateReviewDto } from '../reviews.service';
import { Review } from '../entities/review.entity';
import { ReviewVote } from '../entities/review-vote.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockVoteRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn(), count: jest.fn() };
const mockOrderRepo = { findOne: jest.fn() };
const eligibleQb = { innerJoin: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), getRawOne: jest.fn() };
const mockOrderItemRepo = { createQueryBuilder: jest.fn(() => eligibleQb) };

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
        { provide: getRepositoryToken(ReviewVote), useValue: mockVoteRepo },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepo },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a review for a new user-product pair after delivery check passes', async () => {
      const savedReview = { id: 'r1', ...reviewDto, userId: 'user-1' };
      mockRepo.findOne.mockResolvedValue(null);
      eligibleQb.getRawOne.mockResolvedValue({ '1': 1 });
      mockRepo.create.mockReturnValue(savedReview);
      mockRepo.save.mockResolvedValue(savedReview);

      const result = await service.create('user-1', reviewDto);

      expect(mockRepo.create).toHaveBeenCalledWith({ ...reviewDto, userId: 'user-1' });
      expect(result).toEqual(savedReview);
    });

    it('throws ConflictException if user already reviewed the product', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'r1', productId: 'prod-1', userId: 'user-1' });

      await expect(service.create('user-1', reviewDto)).rejects.toThrow(ConflictException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when user has not received a delivered order for the product', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      eligibleQb.getRawOne.mockResolvedValue(undefined);

      await expect(service.create('user-1', reviewDto)).rejects.toThrow(ForbiddenException);
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

  describe('getRatingDistribution', () => {
    it('returns zero distribution when no reviews exist', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getRatingDistribution('prod-empty');

      expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    });

    it('populates counts for each star rating', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { rating: '5', count: '10' },
          { rating: '4', count: '5' },
          { rating: '2', count: '1' },
        ]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getRatingDistribution('prod-1');

      expect(result[5]).toBe(10);
      expect(result[4]).toBe(5);
      expect(result[3]).toBe(0);
      expect(result[2]).toBe(1);
      expect(result[1]).toBe(0);
    });
  });

  describe('deleteReview', () => {
    it('throws NotFoundException when review does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteReview('r-999', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when non-owner non-admin tries to delete', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'r1', userId: 'owner-user' });

      await expect(service.deleteReview('r1', 'other-user', false)).rejects.toThrow(ForbiddenException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('allows owner to delete their own review', async () => {
      const review = { id: 'r1', userId: 'user-1' };
      mockRepo.findOne.mockResolvedValue(review);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.deleteReview('r1', 'user-1', false);

      expect(mockRepo.remove).toHaveBeenCalledWith(review);
    });

    it('allows admin to delete any review', async () => {
      const review = { id: 'r1', userId: 'owner-user' };
      mockRepo.findOne.mockResolvedValue(review);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.deleteReview('r1', 'admin-user', true);

      expect(mockRepo.remove).toHaveBeenCalledWith(review);
    });
  });

  describe('findAll', () => {
    it('returns paginated reviews with total count', async () => {
      const reviews = [{ id: 'r1' }, { id: 'r2' }];
      mockRepo.findAndCount.mockResolvedValue([reviews, 42]);

      const result = await service.findAll(2, 20);

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
          order: { createdAt: 'DESC' },
        }),
      );
      expect(result).toEqual({ data: reviews, total: 42 });
    });

    it('uses default page=1 limit=20', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll();

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });
});
