import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyController } from '../loyalty.controller';
import { LoyaltyService } from '../loyalty.service';
import type { UserPayload } from '@nextcommerce/shared';

const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };
const admin: UserPayload = { sub: 'admin-1', email: 'admin@test.com', role: 'admin' };

const mockService: Partial<LoyaltyService> = {
  getBalance: jest.fn().mockResolvedValue({ points: 500, tier: 'silver', lifetimePoints: 1200, nextTierPoints: 800 }),
  getTransactionHistory: jest.fn().mockResolvedValue([]),
  redeemPoints: jest.fn().mockResolvedValue({ discountCents: 500, remainingPoints: 400 }),
  awardBonus: jest.fn().mockResolvedValue({ success: true }),
  listAccounts: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  getTierBreakdown: jest.fn().mockResolvedValue({ bronze: 10, silver: 5, gold: 2, platinum: 1 }),
  getAdminStats: jest.fn().mockResolvedValue({ totalPoints: 50000, activeMembers: 18 }),
};

describe('LoyaltyController', () => {
  let controller: LoyaltyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoyaltyController],
      providers: [{ provide: LoyaltyService, useValue: mockService }],
    }).compile();

    controller = module.get(LoyaltyController);
    jest.clearAllMocks();
  });

  it('getBalance() delegates with user sub', async () => {
    await controller.getBalance(user);
    expect(mockService.getBalance).toHaveBeenCalledWith('user-1');
  });

  it('getHistory() uses default limit of 20', async () => {
    await controller.getHistory(user);
    expect(mockService.getTransactionHistory).toHaveBeenCalledWith('user-1', 20);
  });

  it('getHistory() parses limit string', async () => {
    await controller.getHistory(user, '50');
    expect(mockService.getTransactionHistory).toHaveBeenCalledWith('user-1', 50);
  });

  it('redeem() delegates with user sub and points', async () => {
    await controller.redeem({ points: 200 }, user);
    expect(mockService.redeemPoints).toHaveBeenCalledWith('user-1', 200);
  });

  it('awardBonus() delegates dto fields to service', async () => {
    const dto = { userId: 'user-5', points: 100, description: 'Referral bonus' };
    await controller.awardBonus(dto);
    expect(mockService.awardBonus).toHaveBeenCalledWith('user-5', 100, 'Referral bonus');
  });

  it('listAccounts() uses default page and limit', async () => {
    await controller.listAccounts();
    expect(mockService.listAccounts).toHaveBeenCalledWith(1, 30);
  });

  it('listAccounts() parses query strings', async () => {
    await controller.listAccounts('2', '15');
    expect(mockService.listAccounts).toHaveBeenCalledWith(2, 15);
  });

  it('getTierBreakdown() delegates to service', async () => {
    const result = await controller.getTierBreakdown();
    expect(mockService.getTierBreakdown).toHaveBeenCalled();
    expect(result).toHaveProperty('bronze');
  });

  it('getAdminStats() delegates to service', async () => {
    const result = await controller.getAdminStats();
    expect(mockService.getAdminStats).toHaveBeenCalled();
    expect(result).toHaveProperty('totalPoints');
  });
});
