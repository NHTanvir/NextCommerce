import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { LoyaltyService, POINTS_PER_DOLLAR, POINTS_REDEEM_RATE } from '../loyalty.service';
import { LoyaltyAccount } from '../entities/loyalty-account.entity';
import { LoyaltyTransaction } from '../entities/loyalty-transaction.entity';

const mockAccountRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockTxRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

function makeAccount(overrides: Partial<LoyaltyAccount> = {}): LoyaltyAccount {
  return {
    id: 'acc-1',
    userId: 'user-1',
    points: 0,
    lifetimePoints: 0,
    tier: 'bronze',
    updatedAt: new Date(),
    ...overrides,
  } as LoyaltyAccount;
}

describe('LoyaltyService', () => {
  let service: LoyaltyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        { provide: getRepositoryToken(LoyaltyAccount), useValue: mockAccountRepo },
        { provide: getRepositoryToken(LoyaltyTransaction), useValue: mockTxRepo },
      ],
    }).compile();

    service = module.get<LoyaltyService>(LoyaltyService);
    jest.clearAllMocks();
  });

  describe('getOrCreateAccount', () => {
    it('returns existing account when found', async () => {
      const account = makeAccount({ points: 200 });
      mockAccountRepo.findOne.mockResolvedValue(account);

      const result = await service.getOrCreateAccount('user-1');

      expect(result.points).toBe(200);
      expect(mockAccountRepo.save).not.toHaveBeenCalled();
    });

    it('creates new account with zero points when none exists', async () => {
      const newAccount = makeAccount();
      mockAccountRepo.findOne.mockResolvedValue(null);
      mockAccountRepo.create.mockReturnValue(newAccount);
      mockAccountRepo.save.mockResolvedValue(newAccount);

      const result = await service.getOrCreateAccount('new-user');

      expect(mockAccountRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'new-user', points: 0, tier: 'bronze' }),
      );
      expect(result.points).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('returns points, tier, and lifetimePoints', async () => {
      const account = makeAccount({ points: 300, lifetimePoints: 800, tier: 'silver' });
      mockAccountRepo.findOne.mockResolvedValue(account);

      const result = await service.getBalance('user-1');

      expect(result.points).toBe(300);
      expect(result.tier).toBe('silver');
      expect(result.lifetimePoints).toBe(800);
    });

    it('computes nextTierPoints for non-platinum tier', async () => {
      const account = makeAccount({ points: 100, lifetimePoints: 200, tier: 'bronze' });
      mockAccountRepo.findOne.mockResolvedValue(account);

      const result = await service.getBalance('user-1');

      // Bronze → Silver requires 500 lifetime points; user has 200, so 300 more needed
      expect(result.nextTierPoints).toBe(300);
    });

    it('returns null nextTierPoints for platinum tier', async () => {
      const account = makeAccount({ points: 5000, lifetimePoints: 8000, tier: 'platinum' });
      mockAccountRepo.findOne.mockResolvedValue(account);

      const result = await service.getBalance('user-1');

      expect(result.nextTierPoints).toBeNull();
    });
  });

  describe('earnPoints', () => {
    it('calculates points based on order amount and saves transaction', async () => {
      const account = makeAccount();
      mockAccountRepo.findOne.mockResolvedValue(account);
      mockAccountRepo.update.mockResolvedValue({});
      const tx = { id: 'tx-1', type: 'earn', points: 100 };
      mockTxRepo.create.mockReturnValue(tx);
      mockTxRepo.save.mockResolvedValue(tx);

      const result = await service.earnPoints('user-1', 1000, 'ord-1'); // $10 order

      const expectedPoints = Math.floor((1000 / 100) * POINTS_PER_DOLLAR);
      expect(result.points).toBe(expectedPoints);
    });

    it('throws BadRequestException for zero-amount order', async () => {
      const account = makeAccount();
      mockAccountRepo.findOne.mockResolvedValue(account);

      await expect(service.earnPoints('user-1', 0, 'ord-1')).rejects.toThrow(BadRequestException);
    });

    it('increments lifetimePoints when earning', async () => {
      const account = makeAccount({ points: 100, lifetimePoints: 400 });
      mockAccountRepo.findOne.mockResolvedValue(account);
      mockAccountRepo.update.mockResolvedValue({});
      mockTxRepo.create.mockReturnValue({ id: 'tx-1' });
      mockTxRepo.save.mockResolvedValue({ id: 'tx-1' });

      await service.earnPoints('user-1', 5000, 'ord-1');

      const earnedPoints = Math.floor((5000 / 100) * POINTS_PER_DOLLAR);
      expect(mockAccountRepo.update).toHaveBeenCalledWith(
        'acc-1',
        expect.objectContaining({ lifetimePoints: 400 + earnedPoints }),
      );
    });
  });

  describe('redeemPoints', () => {
    it('deducts points and returns correct discount', async () => {
      const account = makeAccount({ points: 500, lifetimePoints: 1000 });
      mockAccountRepo.findOne.mockResolvedValue(account);
      mockAccountRepo.update.mockResolvedValue({});
      mockTxRepo.create.mockReturnValue({ id: 'tx-1' });
      mockTxRepo.save.mockResolvedValue({ id: 'tx-1' });

      const result = await service.redeemPoints('user-1', 200);

      // 200 points / 100 = $2 = 200 cents
      expect(result.discountCents).toBe(200);
    });

    it('throws BadRequestException when insufficient points', async () => {
      const account = makeAccount({ points: 50 });
      mockAccountRepo.findOne.mockResolvedValue(account);

      await expect(service.redeemPoints('user-1', 100)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for zero points', async () => {
      const account = makeAccount({ points: 500 });
      mockAccountRepo.findOne.mockResolvedValue(account);

      await expect(service.redeemPoints('user-1', 0)).rejects.toThrow(BadRequestException);
    });

    it('does not change lifetimePoints when redeeming', async () => {
      const account = makeAccount({ points: 500, lifetimePoints: 1000 });
      mockAccountRepo.findOne.mockResolvedValue(account);
      mockAccountRepo.update.mockResolvedValue({});
      mockTxRepo.create.mockReturnValue({ id: 'tx-1' });
      mockTxRepo.save.mockResolvedValue({ id: 'tx-1' });

      await service.redeemPoints('user-1', 100);

      expect(mockAccountRepo.update).toHaveBeenCalledWith(
        'acc-1',
        expect.objectContaining({ lifetimePoints: 1000 }), // unchanged
      );
    });
  });

  describe('awardBonus', () => {
    it('creates bonus transaction', async () => {
      const account = makeAccount({ points: 100, lifetimePoints: 300 });
      mockAccountRepo.findOne.mockResolvedValue(account);
      mockAccountRepo.update.mockResolvedValue({});
      const tx = { id: 'tx-bonus', type: 'bonus', points: 50 };
      mockTxRepo.create.mockReturnValue(tx);
      mockTxRepo.save.mockResolvedValue(tx);

      const result = await service.awardBonus('user-1', 50, 'Sign-up bonus');

      expect(result.type).toBe('bonus');
      expect(result.points).toBe(50);
    });

    it('throws BadRequestException for zero bonus', async () => {
      const account = makeAccount();
      mockAccountRepo.findOne.mockResolvedValue(account);

      await expect(service.awardBonus('user-1', 0, 'test')).rejects.toThrow(BadRequestException);
    });
  });

  describe('tier upgrades', () => {
    it('upgrades tier from bronze to silver at 500 lifetime points', async () => {
      const account = makeAccount({ points: 100, lifetimePoints: 450 });
      mockAccountRepo.findOne.mockResolvedValue(account);
      mockAccountRepo.update.mockResolvedValue({});
      mockTxRepo.create.mockReturnValue({ id: 'tx-1' });
      mockTxRepo.save.mockResolvedValue({ id: 'tx-1' });

      // Earn enough to push lifetime over 500
      await service.earnPoints('user-1', 6000, 'ord-1'); // earns 60 points → lifetime = 510

      expect(mockAccountRepo.update).toHaveBeenCalledWith(
        'acc-1',
        expect.objectContaining({ tier: 'silver' }),
      );
    });
  });
});
