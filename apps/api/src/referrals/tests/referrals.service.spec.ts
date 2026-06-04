import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReferralsService } from '../referrals.service';
import { Referral } from '../entities/referral.entity';
import { ReferralCode } from '../entities/referral-code.entity';

const mockReferralRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockCodeRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

function makeCode(overrides: Partial<ReferralCode> = {}): ReferralCode {
  return {
    id: 'rc-1',
    userId: 'user-1',
    code: 'USER1ABC123',
    isActive: true,
    createdAt: new Date(),
    ...overrides,
  } as ReferralCode;
}

function makeReferral(overrides: Partial<Referral> = {}): Referral {
  return {
    id: 'r-1',
    referrerId: 'user-1',
    refereeId: 'user-2',
    status: 'pending',
    rewardPointsGranted: null,
    completedAt: null,
    createdAt: new Date(),
    ...overrides,
  } as Referral;
}

describe('ReferralsService', () => {
  let service: ReferralsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: getRepositoryToken(Referral), useValue: mockReferralRepo },
        { provide: getRepositoryToken(ReferralCode), useValue: mockCodeRepo },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
    jest.clearAllMocks();
  });

  describe('getOrCreateCode', () => {
    it('returns existing active code', async () => {
      const code = makeCode();
      mockCodeRepo.findOne.mockResolvedValue(code);

      const result = await service.getOrCreateCode('user-1');

      expect(result).toEqual(code);
      expect(mockCodeRepo.create).not.toHaveBeenCalled();
    });

    it('creates a new code when none exists', async () => {
      const code = makeCode();
      mockCodeRepo.findOne.mockResolvedValue(null);
      mockCodeRepo.create.mockReturnValue(code);
      mockCodeRepo.save.mockResolvedValue(code);

      const result = await service.getOrCreateCode('user-1');

      expect(mockCodeRepo.create).toHaveBeenCalled();
      expect(result).toEqual(code);
    });
  });

  describe('applyReferralCode', () => {
    it('creates a referral when valid code is provided', async () => {
      const code = makeCode({ userId: 'user-1' });
      const referral = makeReferral({ referrerId: 'user-1', refereeId: 'user-2' });

      mockReferralRepo.findOne.mockResolvedValue(null);
      mockCodeRepo.findOne.mockResolvedValue(code);
      mockReferralRepo.create.mockReturnValue(referral);
      mockReferralRepo.save.mockResolvedValue(referral);

      const result = await service.applyReferralCode('user-2', 'USER1ABC123');

      expect(result).toEqual(referral);
    });

    it('throws ConflictException when referee already used a code', async () => {
      mockReferralRepo.findOne.mockResolvedValue(makeReferral());

      await expect(
        service.applyReferralCode('user-2', 'SOMECD'),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when code is invalid', async () => {
      mockReferralRepo.findOne.mockResolvedValue(null);
      mockCodeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.applyReferralCode('user-2', 'INVALID'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when user tries to use own code', async () => {
      const code = makeCode({ userId: 'user-1' });
      mockReferralRepo.findOne.mockResolvedValue(null);
      mockCodeRepo.findOne.mockResolvedValue(code);

      await expect(
        service.applyReferralCode('user-1', 'USER1ABC123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeReferral', () => {
    it('marks pending referral as completed with reward points', async () => {
      const referral = makeReferral({ status: 'pending' });
      const completed = makeReferral({ status: 'completed', rewardPointsGranted: 500 });

      mockReferralRepo.findOne
        .mockResolvedValueOnce(referral)
        .mockResolvedValueOnce(completed);
      mockReferralRepo.update.mockResolvedValue({});

      const result = await service.completeReferral('user-2');

      expect(mockReferralRepo.update).toHaveBeenCalledWith(
        referral.id,
        expect.objectContaining({ status: 'completed', rewardPointsGranted: 500 }),
      );
      expect(result?.status).toBe('completed');
    });

    it('returns null when no pending referral found', async () => {
      mockReferralRepo.findOne.mockResolvedValue(null);

      const result = await service.completeReferral('user-2');

      expect(result).toBeNull();
    });
  });

  describe('getReferralStats', () => {
    it('returns correct counts and totals', async () => {
      const code = makeCode({ code: 'MYCODE1' });
      const referrals = [
        makeReferral({ status: 'completed', rewardPointsGranted: 500 }),
        makeReferral({ status: 'completed', rewardPointsGranted: 500 }),
        makeReferral({ status: 'pending', rewardPointsGranted: null }),
      ];

      mockCodeRepo.findOne.mockResolvedValue(code);
      mockReferralRepo.find.mockResolvedValue(referrals);

      const stats = await service.getReferralStats('user-1');

      expect(stats.code).toBe('MYCODE1');
      expect(stats.totalReferrals).toBe(3);
      expect(stats.completedReferrals).toBe(2);
      expect(stats.pendingReferrals).toBe(1);
      expect(stats.totalPointsEarned).toBe(1000);
    });

    it('returns null code when no code exists', async () => {
      mockCodeRepo.findOne.mockResolvedValue(null);
      mockReferralRepo.find.mockResolvedValue([]);

      const stats = await service.getReferralStats('user-1');

      expect(stats.code).toBeNull();
      expect(stats.totalReferrals).toBe(0);
    });
  });
});
