import { Test, TestingModule } from '@nestjs/testing';
import { BackInStockController } from '../back-in-stock.controller';
import { BackInStockService } from '../back-in-stock.service';
import type { UserPayload } from '@nextcommerce/shared';

const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockSub = { id: 's-1', userId: 'user-1', variantId: 'v-1', productId: 'p-1', notified: false };

const mockService: Partial<BackInStockService> = {
  findForUser: jest.fn().mockResolvedValue([mockSub]),
  hasSubscription: jest.fn().mockResolvedValue(false),
  subscribe: jest.fn().mockResolvedValue(mockSub),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue({ data: [mockSub], total: 1 }),
  getMostRequestedVariants: jest.fn().mockResolvedValue([{ variantId: 'v-1', count: 5 }]),
};

describe('BackInStockController', () => {
  let controller: BackInStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackInStockController],
      providers: [{ provide: BackInStockService, useValue: mockService }],
    }).compile();

    controller = module.get(BackInStockController);
    jest.clearAllMocks();
  });

  it('findForUser() delegates user sub', async () => {
    await controller.findForUser(user);
    expect(mockService.findForUser).toHaveBeenCalledWith('user-1');
  });

  it('getStatus() wraps result in { subscribed }', async () => {
    const result = await controller.getStatus(user, 'v-1');
    expect(mockService.hasSubscription).toHaveBeenCalledWith('user-1', 'v-1');
    expect(result).toEqual({ subscribed: false });
  });

  it('subscribe() delegates user sub, variantId, productId', async () => {
    await controller.subscribe(user, { variantId: 'v-1', productId: 'p-1' });
    expect(mockService.subscribe).toHaveBeenCalledWith('user-1', 'v-1', 'p-1');
  });

  it('unsubscribe() delegates user sub and variantId', async () => {
    await controller.unsubscribe(user, 'v-1');
    expect(mockService.unsubscribe).toHaveBeenCalledWith('user-1', 'v-1');
  });

  it('findAll() uses default page and limit', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledWith(1, 30);
  });

  it('findAll() parses page and limit strings', async () => {
    await controller.findAll('2', '10');
    expect(mockService.findAll).toHaveBeenCalledWith(2, 10);
  });

  it('getMostRequested() uses default limit of 20', async () => {
    await controller.getMostRequested();
    expect(mockService.getMostRequestedVariants).toHaveBeenCalledWith(20);
  });

  it('getMostRequested() parses limit string', async () => {
    await controller.getMostRequested('5');
    expect(mockService.getMostRequestedVariants).toHaveBeenCalledWith(5);
  });
});
