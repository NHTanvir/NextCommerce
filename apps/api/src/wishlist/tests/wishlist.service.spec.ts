import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WishlistService } from '../wishlist.service';
import { WishlistItem } from '../entities/wishlist-item.entity';

const mockQb: any = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawMany: jest.fn(),
};

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQb),
});

const userId = 'user-1';
const productId = 'prod-1';

describe('WishlistService', () => {
  let service: WishlistService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: getRepositoryToken(WishlistItem), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(WishlistService);
    repo = module.get(getRepositoryToken(WishlistItem));
  });

  describe('findByUser', () => {
    it('returns all wishlist items for the user', async () => {
      const items = [{ id: 'w1' }, { id: 'w2' }];
      repo.find.mockResolvedValue(items);
      const result = await service.findByUser(userId);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId }, order: { addedAt: 'DESC' } }),
      );
      expect(result).toBe(items);
    });
  });

  describe('add', () => {
    it('saves new wishlist item', async () => {
      repo.findOne.mockResolvedValue(null);
      const item = { id: 'w1', userId, productId };
      repo.create.mockReturnValue(item);
      repo.save.mockResolvedValue(item);
      const result = await service.add(userId, productId);
      expect(result).toBe(item);
    });

    it('throws ConflictException if already wishlisted', async () => {
      repo.findOne.mockResolvedValue({ id: 'w1', userId, productId });
      await expect(service.add(userId, productId)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('removes existing wishlist item', async () => {
      const item = { id: 'w1', userId, productId };
      repo.findOne.mockResolvedValue(item);
      repo.remove.mockResolvedValue(undefined);
      await expect(service.remove(userId, productId)).resolves.not.toThrow();
      expect(repo.remove).toHaveBeenCalledWith(item);
    });

    it('throws NotFoundException if not in wishlist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(userId, productId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('isWishlisted', () => {
    it('returns true when item exists', async () => {
      repo.count.mockResolvedValue(1);
      expect(await service.isWishlisted(userId, productId)).toBe(true);
    });

    it('returns false when item does not exist', async () => {
      repo.count.mockResolvedValue(0);
      expect(await service.isWishlisted(userId, productId)).toBe(false);
    });
  });

  describe('toggle', () => {
    it('removes and returns wishlisted=false if already in wishlist', async () => {
      const item = { id: 'w1', userId, productId };
      repo.findOne.mockResolvedValue(item);
      repo.remove.mockResolvedValue(undefined);
      const result = await service.toggle(userId, productId);
      expect(result).toEqual({ wishlisted: false });
    });

    it('adds and returns wishlisted=true if not in wishlist', async () => {
      repo.findOne.mockResolvedValue(null);
      const item = { id: 'w1', userId, productId };
      repo.create.mockReturnValue(item);
      repo.save.mockResolvedValue(item);
      const result = await service.toggle(userId, productId);
      expect(result).toEqual({ wishlisted: true });
    });
  });

  describe('getMostWishlisted', () => {
    it('returns parsed most-wishlisted products', async () => {
      mockQb.getRawMany.mockResolvedValue([
        { productId: 'p1', count: '15' },
        { productId: 'p2', count: '8' },
      ]);
      const result = await service.getMostWishlisted(5);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ productId: 'p1', count: 15 });
    });

    it('returns empty array when nothing wishlisted', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      expect(await service.getMostWishlisted(10)).toEqual([]);
    });
  });

  describe('getCountForProduct', () => {
    it('returns count for given product', async () => {
      repo.count.mockResolvedValue(42);
      const result = await service.getCountForProduct('p1');
      expect(result).toBe(42);
      expect(repo.count).toHaveBeenCalledWith({ where: { productId: 'p1' } });
    });
  });
});
