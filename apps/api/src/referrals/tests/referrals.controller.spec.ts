import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsController } from '../referrals.controller';
import { ReferralsService } from '../referrals.service';
import type { UserPayload } from '@nextcommerce/shared';

const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockService: Partial<ReferralsService> = {
  getOrCreateCode: jest.fn().mockResolvedValue({ code: 'REFABC123', userId: 'user-1' }),
  getReferralStats: jest.fn().mockResolvedValue({ completedReferrals: 3, totalPointsEarned: 300 }),
  getReferralHistory: jest.fn().mockResolvedValue([]),
  applyReferralCode: jest.fn().mockResolvedValue({ success: true, pointsAwarded: 100 }),
  getAdminOverview: jest.fn().mockResolvedValue({ totalReferrals: 50, conversionRate: 0.4 }),
  adminListReferrals: jest.fn().mockResolvedValue({ data: [], total: 0 }),
};

describe('ReferralsController', () => {
  let controller: ReferralsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralsController],
      providers: [{ provide: ReferralsService, useValue: mockService }],
    }).compile();

    controller = module.get(ReferralsController);
    jest.clearAllMocks();
  });

  it('getCode() delegates user sub', async () => {
    const result = await controller.getCode(user);
    expect(mockService.getOrCreateCode).toHaveBeenCalledWith('user-1');
    expect((result as any).code).toBe('REFABC123');
  });

  it('getStats() delegates user sub', async () => {
    await controller.getStats(user);
    expect(mockService.getReferralStats).toHaveBeenCalledWith('user-1');
  });

  it('getHistory() delegates user sub', async () => {
    await controller.getHistory(user);
    expect(mockService.getReferralHistory).toHaveBeenCalledWith('user-1');
  });

  it('applyCode() delegates user sub and code', async () => {
    await controller.applyCode(user, { code: 'REFXYZ789' });
    expect(mockService.applyReferralCode).toHaveBeenCalledWith('user-1', 'REFXYZ789');
  });

  it('adminOverview() delegates to service', async () => {
    const result = await controller.adminOverview();
    expect(mockService.getAdminOverview).toHaveBeenCalled();
    expect(result).toHaveProperty('totalReferrals');
  });

  it('adminList() uses default page and limit', async () => {
    await controller.adminList();
    expect(mockService.adminListReferrals).toHaveBeenCalledWith(1, 20);
  });

  it('adminList() parses page and limit strings', async () => {
    await controller.adminList('2', '10');
    expect(mockService.adminListReferrals).toHaveBeenCalledWith(2, 10);
  });
});
