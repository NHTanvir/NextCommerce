import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from '../audit.controller';
import { AuditService } from '../audit.service';
import type { UserPayload } from '@nextcommerce/shared';

const me: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockService: Partial<AuditService> = {
  findByUser: jest.fn().mockResolvedValue([]),
  findRecent: jest.fn().mockResolvedValue([]),
  findByAction: jest.fn().mockResolvedValue([]),
  getStats: jest.fn().mockResolvedValue({ total: 500, last24h: 30, byAction: [] }),
};

describe('AuditController', () => {
  let controller: AuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: mockService }],
    }).compile();

    controller = module.get(AuditController);
    jest.clearAllMocks();
  });

  it('getMyActivity() uses default limit of 30', async () => {
    await controller.getMyActivity(me);
    expect(mockService.findByUser).toHaveBeenCalledWith('user-1', 30);
  });

  it('getMyActivity() caps limit at 100', async () => {
    await controller.getMyActivity(me, '200');
    expect(mockService.findByUser).toHaveBeenCalledWith('user-1', 100);
  });

  it('getMyActivity() parses valid limit', async () => {
    await controller.getMyActivity(me, '50');
    expect(mockService.findByUser).toHaveBeenCalledWith('user-1', 50);
  });

  it('findRecent() uses default limit of 100', async () => {
    await controller.findRecent();
    expect(mockService.findRecent).toHaveBeenCalledWith(100);
  });

  it('findRecent() caps limit at 500', async () => {
    await controller.findRecent('1000');
    expect(mockService.findRecent).toHaveBeenCalledWith(500);
  });

  it('findByUser() delegates userId and limit', async () => {
    await controller.findByUser('user-2', '20');
    expect(mockService.findByUser).toHaveBeenCalledWith('user-2', 20);
  });

  it('findByAction() delegates action and limit', async () => {
    await controller.findByAction('order.create' as any, '30');
    expect(mockService.findByAction).toHaveBeenCalledWith('order.create', 30);
  });

  it('getStats() delegates to service', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });
});
