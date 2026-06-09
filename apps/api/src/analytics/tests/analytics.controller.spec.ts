import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../analytics.controller';
import { AnalyticsService } from '../analytics.service';

const mockService: Partial<AnalyticsService> = {
  getDashboardSummary: jest.fn().mockResolvedValue({
    totalRevenueCents: 1000000,
    totalOrders: 50,
    totalCustomers: 30,
    avgOrderValueCents: 20000,
    pendingOrders: 5,
  }),
  getRevenueByDay: jest.fn().mockResolvedValue([]),
  getTopProducts: jest.fn().mockResolvedValue([]),
  getOrderStatusBreakdown: jest.fn().mockResolvedValue([]),
  getNewCustomersByDay: jest.fn().mockResolvedValue([]),
  getRepeatCustomerRate: jest.fn().mockResolvedValue({ repeatRate: 0.4, avgOrdersPerCustomer: 2.1 }),
  getRevenueByCategory: jest.fn().mockResolvedValue([]),
  getHourlySalesDistribution: jest.fn().mockResolvedValue([]),
  getTopCustomers: jest.fn().mockResolvedValue([]),
  getCustomerSegments: jest.fn().mockResolvedValue({}),
  getMonthlyCohortRetention: jest.fn().mockResolvedValue([]),
  getAverageOrderValueTrend: jest.fn().mockResolvedValue([]),
  getRevenueByWeekday: jest.fn().mockResolvedValue([]),
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockService }],
    }).compile();

    controller = module.get(AnalyticsController);
    jest.clearAllMocks();
  });

  it('getSummary() calls getDashboardSummary', async () => {
    (mockService.getDashboardSummary as jest.Mock).mockResolvedValue({ totalOrders: 10 });
    const result = await controller.getSummary();
    expect(mockService.getDashboardSummary).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ totalOrders: 10 });
  });

  it('getRevenue() caps days at 365', async () => {
    await controller.getRevenue(500);
    expect(mockService.getRevenueByDay).toHaveBeenCalledWith(365);
  });

  it('getRevenue() passes days through when under cap', async () => {
    await controller.getRevenue(14);
    expect(mockService.getRevenueByDay).toHaveBeenCalledWith(14);
  });

  it('getTopProducts() caps limit at 50', async () => {
    await controller.getTopProducts(100);
    expect(mockService.getTopProducts).toHaveBeenCalledWith(50);
  });

  it('getOrderStatusBreakdown() delegates to service', async () => {
    await controller.getOrderStatusBreakdown();
    expect(mockService.getOrderStatusBreakdown).toHaveBeenCalled();
  });

  it('getNewCustomers() caps days at 365', async () => {
    await controller.getNewCustomers(400);
    expect(mockService.getNewCustomersByDay).toHaveBeenCalledWith(365);
  });

  it('getRepeatCustomerRate() delegates to service', async () => {
    await controller.getRepeatCustomerRate();
    expect(mockService.getRepeatCustomerRate).toHaveBeenCalled();
  });

  it('getTopCustomers() caps limit at 50', async () => {
    await controller.getTopCustomers(60);
    expect(mockService.getTopCustomers).toHaveBeenCalledWith(50);
  });

  it('getCohortRetention() caps months at 24', async () => {
    await controller.getCohortRetention(30);
    expect(mockService.getMonthlyCohortRetention).toHaveBeenCalledWith(24);
  });

  it('getAovTrend() caps days at 365', async () => {
    await controller.getAovTrend(1000);
    expect(mockService.getAverageOrderValueTrend).toHaveBeenCalledWith(365);
  });

  it('getRevenueByWeekday() delegates to service', async () => {
    await controller.getRevenueByWeekday();
    expect(mockService.getRevenueByWeekday).toHaveBeenCalled();
  });
});
