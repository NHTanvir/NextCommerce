import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CouponsService } from '../coupons.service';
import { Coupon } from '../entities/coupon.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  increment: jest.fn(),
};

const buildCoupon = (overrides: Partial<Coupon> = {}): Coupon =>
  ({
    id: 'c1',
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderCents: null,
    maxUsageCount: null,
    usageCount: 0,
    expiresAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Coupon);

describe('CouponsService', () => {
  let service: CouponsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: getRepositoryToken(Coupon), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('uppercases the code before saving', async () => {
      const dto = { code: 'save20', discountType: 'percentage' as const, discountValue: 20 };
      const coupon = buildCoupon({ code: 'SAVE20' });
      mockRepo.create.mockReturnValue(coupon);
      mockRepo.save.mockResolvedValue(coupon);

      await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ code: 'SAVE20' }));
    });
  });

  describe('validate', () => {
    it('returns valid=false for unknown code', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.validate('BADCODE', 10000);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/invalid/i);
    });

    it('returns valid=false for expired coupon', async () => {
      const past = new Date(Date.now() - 86_400_000);
      mockRepo.findOne.mockResolvedValue(buildCoupon({ expiresAt: past }));
      const result = await service.validate('SAVE20', 10000);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/expired/i);
    });

    it('returns valid=false when usage limit reached', async () => {
      mockRepo.findOne.mockResolvedValue(buildCoupon({ maxUsageCount: 5, usageCount: 5 }));
      const result = await service.validate('SAVE20', 10000);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/limit/i);
    });

    it('returns valid=false when order below minimum', async () => {
      mockRepo.findOne.mockResolvedValue(buildCoupon({ minOrderCents: 5000 }));
      const result = await service.validate('SAVE20', 2000);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/minimum/i);
    });

    it('calculates percentage discount correctly', async () => {
      mockRepo.findOne.mockResolvedValue(buildCoupon({ discountType: 'percentage', discountValue: 20 }));
      const result = await service.validate('SAVE20', 10000);
      expect(result.valid).toBe(true);
      expect(result.discountCents).toBe(2000);
    });

    it('calculates fixed discount correctly', async () => {
      mockRepo.findOne.mockResolvedValue(buildCoupon({ discountType: 'fixed', discountValue: 500 }));
      const result = await service.validate('FLAT5', 10000);
      expect(result.valid).toBe(true);
      expect(result.discountCents).toBe(500);
    });

    it('caps fixed discount at order total', async () => {
      mockRepo.findOne.mockResolvedValue(buildCoupon({ discountType: 'fixed', discountValue: 5000 }));
      const result = await service.validate('FLAT50', 3000);
      expect(result.valid).toBe(true);
      expect(result.discountCents).toBe(3000);
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      const coupon = buildCoupon({ isActive: true });
      mockRepo.findOne.mockResolvedValue(coupon);
      mockRepo.save.mockResolvedValue({ ...coupon, isActive: false });

      const result = await service.deactivate('c1');

      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
    });

    it('throws NotFoundException for unknown id', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.deactivate('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('redeem', () => {
    it('increments usageCount by 1', async () => {
      mockRepo.increment.mockResolvedValue({});
      await service.redeem('c1');
      expect(mockRepo.increment).toHaveBeenCalledWith({ id: 'c1' }, 'usageCount', 1);
    });
  });
});
