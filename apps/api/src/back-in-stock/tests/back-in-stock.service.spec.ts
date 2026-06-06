import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BackInStockService } from '../back-in-stock.service';
import { BackInStockSubscription } from '../entities/back-in-stock.entity';

const mockQb: any = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  findAndCount: jest.fn(),
  getRawMany: jest.fn(),
};

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQb),
};

function makeSub(overrides: Partial<BackInStockSubscription> = {}): BackInStockSubscription {
  return {
    id: 's-1',
    userId: 'user-1',
    variantId: 'v-1',
    productId: 'p-1',
    notified: false,
    notifiedAt: null,
    createdAt: new Date(),
    ...overrides,
  } as BackInStockSubscription;
}

describe('BackInStockService', () => {
  let service: BackInStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackInStockService,
        { provide: getRepositoryToken(BackInStockSubscription), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<BackInStockService>(BackInStockService);
    jest.clearAllMocks();
  });

  describe('subscribe', () => {
    it('creates a new subscription', async () => {
      const sub = makeSub();
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(sub);
      mockRepo.save.mockResolvedValue(sub);

      const result = await service.subscribe('user-1', 'v-1', 'p-1');

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', variantId: 'v-1', notified: false }),
      );
      expect(result).toEqual(sub);
    });

    it('throws ConflictException when active subscription exists', async () => {
      mockRepo.findOne.mockResolvedValue(makeSub({ notified: false }));

      await expect(service.subscribe('user-1', 'v-1', 'p-1')).rejects.toThrow(ConflictException);
    });

    it('re-subscribes when previous subscription was already notified', async () => {
      const notified = makeSub({ notified: true });
      const reactivated = makeSub({ notified: false });
      mockRepo.findOne.mockResolvedValueOnce(notified).mockResolvedValueOnce(reactivated);
      mockRepo.update.mockResolvedValue({});

      const result = await service.subscribe('user-1', 'v-1', 'p-1');

      expect(mockRepo.update).toHaveBeenCalledWith(
        notified.id,
        { notified: false, notifiedAt: null },
      );
      expect(result).toEqual(reactivated);
    });
  });

  describe('unsubscribe', () => {
    it('removes subscription', async () => {
      const sub = makeSub();
      mockRepo.findOne.mockResolvedValue(sub);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.unsubscribe('user-1', 'v-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(sub);
    });

    it('throws NotFoundException when not subscribed', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.unsubscribe('user-1', 'v-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPendingForVariant', () => {
    it('returns all non-notified subs for a variant', async () => {
      const subs = [makeSub(), makeSub({ userId: 'user-2' })];
      mockRepo.find.mockResolvedValue(subs);

      const result = await service.findPendingForVariant('v-1');

      expect(result).toEqual(subs);
      expect(mockRepo.find).toHaveBeenCalledWith({ where: { variantId: 'v-1', notified: false } });
    });
  });

  describe('markAllNotified', () => {
    it('returns count of affected rows', async () => {
      mockRepo.update.mockResolvedValue({ affected: 3 });

      const count = await service.markAllNotified('v-1');

      expect(count).toBe(3);
      expect(mockRepo.update).toHaveBeenCalledWith(
        { variantId: 'v-1', notified: false },
        expect.objectContaining({ notified: true }),
      );
    });

    it('returns 0 when no pending subscriptions', async () => {
      mockRepo.update.mockResolvedValue({ affected: 0 });

      const count = await service.markAllNotified('v-1');

      expect(count).toBe(0);
    });
  });

  describe('hasSubscription', () => {
    it('returns true when active subscription exists', async () => {
      mockRepo.count.mockResolvedValue(1);

      const result = await service.hasSubscription('user-1', 'v-1');

      expect(result).toBe(true);
    });

    it('returns false when no active subscription', async () => {
      mockRepo.count.mockResolvedValue(0);

      const result = await service.hasSubscription('user-1', 'v-1');

      expect(result).toBe(false);
    });
  });

  describe('getMostRequestedVariants', () => {
    it('returns ranked variants with pending count', async () => {
      mockQb.getRawMany.mockResolvedValue([
        { variantId: 'v-1', productId: 'p-1', pendingCount: '12' },
        { variantId: 'v-2', productId: 'p-2', pendingCount: '7' },
      ]);

      const result = await service.getMostRequestedVariants(10);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ variantId: 'v-1', productId: 'p-1', pendingCount: 12 });
      expect(result[1].pendingCount).toBe(7);
    });

    it('returns empty array when no pending subscriptions', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      const result = await service.getMostRequestedVariants(5);
      expect(result).toEqual([]);
    });
  });
});
