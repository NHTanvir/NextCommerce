import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from '../reviews.controller';
import { ReviewsService, CreateReviewDto } from '../reviews.service';
import { UserPayload } from '@nextcommerce/shared';

const mockService = {
  findByProduct: jest.fn(),
  create: jest.fn(),
  getAverageRating: jest.fn(),
};

const mockUser: UserPayload = {
  sub: 'user-1',
  id: 'user-1',
  email: 'user@test.com',
  role: 'customer',
};

describe('ReviewsController', () => {
  let controller: ReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockService }],
    }).compile();

    controller = module.get(ReviewsController);
    jest.clearAllMocks();
  });

  describe('findByProduct', () => {
    it('returns reviews for the given product', async () => {
      const reviews = [{ id: 'r1' }, { id: 'r2' }];
      mockService.findByProduct.mockResolvedValue(reviews);
      const result = await controller.findByProduct('prod-1');
      expect(mockService.findByProduct).toHaveBeenCalledWith('prod-1');
      expect(result).toBe(reviews);
    });
  });

  describe('create', () => {
    it('creates a review for the current user', async () => {
      const dto: CreateReviewDto = {
        productId: 'prod-1',
        rating: 5,
        title: 'Amazing',
        body: 'Best shoes I have ever owned!',
      };
      const review = { id: 'r1', ...dto, userId: 'user-1' };
      mockService.create.mockResolvedValue(review);
      const result = await controller.create(dto, mockUser);
      expect(mockService.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toBe(review);
    });
  });
});
