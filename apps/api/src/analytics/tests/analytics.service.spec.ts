import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from '../analytics.service';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

const mockOrderRepo = () => ({
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockUserRepo = () => ({
  count: jest.fn(),
});

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let orderRepo: ReturnType<typeof mockOrderRepo>;
  let userRepo: ReturnType<typeof mockUserRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Order), useFactory: mockOrderRepo },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
      ],
    }).compile();

    service = module.get(AnalyticsService);
    orderRepo = module.get(getRepositoryToken(Order));
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('getDashboardSummary', () => {
    it('returns correct summary stats', async () => {
      orderRepo.count.mockResolvedValue(150);
      userRepo.count.mockResolvedValue(120);

      const revenueQb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '500000' }),
      };
      const pendingQb = 12;
      orderRepo.createQueryBuilder.mockReturnValue(revenueQb);
      // second call for pending (uses count directly)
      orderRepo.count
        .mockResolvedValueOnce(150) // totalOrders
        .mockResolvedValueOnce(12); // pendingOrders

      const result = await service.getDashboardSummary();

      expect(result.totalOrders).toBe(150);
      expect(result.totalCustomers).toBe(120);
    });

    it('returns zero avgOrderValueCents when no orders', async () => {
      orderRepo.count.mockResolvedValue(0);
      userRepo.count.mockResolvedValue(0);

      const qb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: null }),
      };
      orderRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getDashboardSummary();
      expect(result.avgOrderValueCents).toBe(0);
    });
  });

  describe('getRevenueByDay', () => {
    it('returns mapped revenue data', async () => {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2025-01-01', totalCents: '15000', orderCount: '3' },
          { date: '2025-01-02', totalCents: '22500', orderCount: '5' },
        ]),
      };
      orderRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getRevenueByDay(7);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2025-01-01', totalCents: 15000, orderCount: 3 });
    });

    it('returns empty array when no data', async () => {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      orderRepo.createQueryBuilder.mockReturnValue(qb);
      expect(await service.getRevenueByDay(30)).toEqual([]);
    });
  });

  describe('getTopProducts', () => {
    it('returns top products mapped from raw query', async () => {
      const qb: any = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { productTitle: 'Air Max Pro', totalQuantity: '50', totalRevenueCents: '750000' },
        ]),
      };
      orderRepo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.getTopProducts(5);
      expect(result[0]).toEqual({
        productTitle: 'Air Max Pro',
        totalQuantity: 50,
        totalRevenueCents: 750000,
      });
    });
  });
});
