import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { OrdersService } from '../orders.service';

const mockService = {
  create: jest.fn(),
  findByUser: jest.fn(),
  findOne: jest.fn(),
  updateStatus: jest.fn(),
};

const mockUser = { id: 'user-1', email: 'user@test.com', role: 'customer' };

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('calls service.create with userId from JWT and body', async () => {
      const dto = { addressId: 'addr-1' };
      const order = { id: 'o1', status: 'paid' };
      mockService.create.mockResolvedValue(order);

      const result = await (controller as any).create(mockUser, dto);

      expect(mockService.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(order);
    });
  });

  describe('findMyOrders', () => {
    it('returns orders for the authenticated user', async () => {
      const orders = [{ id: 'o1' }, { id: 'o2' }];
      mockService.findByUser.mockResolvedValue(orders);

      const result = await (controller as any).findMyOrders(mockUser);

      expect(mockService.findByUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(orders);
    });
  });

  describe('findOne', () => {
    it('delegates to service.findOne', async () => {
      const order = { id: 'o1', status: 'paid' };
      mockService.findOne.mockResolvedValue(order);

      const result = await (controller as any).findOne('o1');

      expect(mockService.findOne).toHaveBeenCalledWith('o1');
      expect(result).toEqual(order);
    });
  });

  describe('updateStatus', () => {
    it('calls service.updateStatus with id, new status, and actorId', async () => {
      const updated = { id: 'o1', status: 'shipped' };
      mockService.updateStatus.mockResolvedValue(updated);

      const result = await (controller as any).updateStatus('o1', { status: 'shipped' }, mockUser);

      expect(mockService.updateStatus).toHaveBeenCalledWith('o1', 'shipped', 'user-1');
      expect(result).toEqual(updated);
    });
  });
});
