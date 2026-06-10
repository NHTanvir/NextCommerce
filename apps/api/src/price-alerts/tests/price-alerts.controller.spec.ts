import { Test, TestingModule } from '@nestjs/testing';
import { PriceAlertsController } from '../price-alerts.controller';
import { PriceAlertsService } from '../price-alerts.service';
import type { UserPayload } from '@nextcommerce/shared';

const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockAlert = { id: 'a-1', userId: 'user-1', productId: 'p-1', targetPriceCents: 4999, isActive: true };

const mockService: Partial<PriceAlertsService> = {
  findForUser: jest.fn().mockResolvedValue([mockAlert]),
  getAlert: jest.fn().mockResolvedValue(mockAlert),
  subscribe: jest.fn().mockResolvedValue(mockAlert),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue({ data: [mockAlert], total: 1 }),
  getAdminStats: jest.fn().mockResolvedValue({ total: 20, active: 18, triggered: 2 }),
};

describe('PriceAlertsController', () => {
  let controller: PriceAlertsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceAlertsController],
      providers: [{ provide: PriceAlertsService, useValue: mockService }],
    }).compile();

    controller = module.get(PriceAlertsController);
    jest.clearAllMocks();
  });

  it('findForUser() delegates user sub', async () => {
    await controller.findForUser(user);
    expect(mockService.findForUser).toHaveBeenCalledWith('user-1');
  });

  it('getAlert() wraps result in { hasAlert, targetPriceCents }', async () => {
    const result = await controller.getAlert(user, 'p-1');
    expect(mockService.getAlert).toHaveBeenCalledWith('user-1', 'p-1');
    expect(result).toEqual({ hasAlert: true, targetPriceCents: 4999 });
  });

  it('getAlert() returns hasAlert=false when no alert exists', async () => {
    (mockService.getAlert as jest.Mock).mockResolvedValueOnce(null);
    const result = await controller.getAlert(user, 'p-99');
    expect(result).toEqual({ hasAlert: false, targetPriceCents: null });
  });

  it('subscribe() delegates user sub and dto', async () => {
    const dto = { productId: 'p-1', targetPriceCents: 3999 } as any;
    await controller.subscribe(user, dto);
    expect(mockService.subscribe).toHaveBeenCalledWith('user-1', dto);
  });

  it('unsubscribe() delegates user sub and productId', async () => {
    await controller.unsubscribe(user, 'p-1');
    expect(mockService.unsubscribe).toHaveBeenCalledWith('user-1', 'p-1');
  });

  it('findAll() uses default page and limit', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledWith(1, 30);
  });

  it('findAll() parses page and limit strings', async () => {
    await controller.findAll('3', '15');
    expect(mockService.findAll).toHaveBeenCalledWith(3, 15);
  });

  it('getAdminStats() delegates to service', async () => {
    const result = await controller.getAdminStats();
    expect(mockService.getAdminStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });
});
