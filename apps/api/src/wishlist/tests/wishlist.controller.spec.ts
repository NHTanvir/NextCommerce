import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from '../wishlist.controller';
import { WishlistService } from '../wishlist.service';
import { UserPayload } from '@nextcommerce/shared';

const mockService = {
  findByUser: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  toggle: jest.fn(),
};

const mockUser: UserPayload = {
  sub: 'user-1',
  id: 'user-1',
  email: 'user@test.com',
  role: 'customer',
};

describe('WishlistController', () => {
  let controller: WishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [{ provide: WishlistService, useValue: mockService }],
    }).compile();

    controller = module.get(WishlistController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns wishlist for current user', async () => {
      const items = [{ id: 'w1' }];
      mockService.findByUser.mockResolvedValue(items);
      const result = await controller.findAll(mockUser);
      expect(mockService.findByUser).toHaveBeenCalledWith('user-1');
      expect(result).toBe(items);
    });
  });

  describe('add', () => {
    it('adds product to wishlist', async () => {
      const item = { id: 'w1', userId: 'user-1', productId: 'prod-1' };
      mockService.add.mockResolvedValue(item);
      const result = await controller.add(mockUser, 'prod-1');
      expect(mockService.add).toHaveBeenCalledWith('user-1', 'prod-1');
      expect(result).toBe(item);
    });
  });

  describe('remove', () => {
    it('removes product from wishlist', async () => {
      mockService.remove.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'prod-1');
      expect(mockService.remove).toHaveBeenCalledWith('user-1', 'prod-1');
    });
  });

  describe('toggle', () => {
    it('toggles wishlist status', async () => {
      mockService.toggle.mockResolvedValue({ wishlisted: true });
      const result = await controller.toggle(mockUser, 'prod-1');
      expect(result).toEqual({ wishlisted: true });
    });
  });
});
