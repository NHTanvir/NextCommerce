import { Test, TestingModule } from '@nestjs/testing';
import { ReturnsController } from '../returns.controller';
import { ReturnsService } from '../returns.service';
import type { UserPayload } from '@nextcommerce/shared';

const admin: UserPayload = { sub: 'admin-1', email: 'admin@test.com', role: 'admin' };
const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockReturn = { id: 'r-1', orderId: 'o-1', userId: 'user-1', status: 'pending', reason: 'damaged' };

const mockService: Partial<ReturnsService> = {
  create: jest.fn().mockResolvedValue(mockReturn),
  findByUser: jest.fn().mockResolvedValue([mockReturn]),
  findAll: jest.fn().mockResolvedValue([mockReturn]),
  findOne: jest.fn().mockResolvedValue(mockReturn),
  updateStatus: jest.fn().mockResolvedValue({ ...mockReturn, status: 'approved' }),
  getStats: jest.fn().mockResolvedValue({ total: 5, pending: 2, approved: 2, rejected: 1 }),
};

describe('ReturnsController', () => {
  let controller: ReturnsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnsController],
      providers: [{ provide: ReturnsService, useValue: mockService }],
    }).compile();

    controller = module.get(ReturnsController);
    jest.clearAllMocks();
  });

  it('create() delegates user sub and dto', async () => {
    const dto = { orderId: 'o-1', reason: 'damaged' } as any;
    await controller.create(user, dto);
    expect(mockService.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('findMine() delegates user sub', async () => {
    await controller.findMine(user);
    expect(mockService.findByUser).toHaveBeenCalledWith('user-1');
  });

  it('findAll() delegates to service without status filter', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll() passes status filter when provided', async () => {
    await controller.findAll('pending' as any);
    expect(mockService.findAll).toHaveBeenCalledWith('pending');
  });

  it('findOne() passes undefined userId for admin', async () => {
    await controller.findOne(admin, 'r-1');
    expect(mockService.findOne).toHaveBeenCalledWith('r-1', undefined);
  });

  it('findOne() passes userId for regular user', async () => {
    await controller.findOne(user, 'r-1');
    expect(mockService.findOne).toHaveBeenCalledWith('r-1', 'user-1');
  });

  it('updateStatus() delegates id and dto', async () => {
    const dto = { status: 'approved' } as any;
    await controller.updateStatus('r-1', dto);
    expect(mockService.updateStatus).toHaveBeenCalledWith('r-1', dto);
  });

  it('getStats() delegates to service', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });
});
