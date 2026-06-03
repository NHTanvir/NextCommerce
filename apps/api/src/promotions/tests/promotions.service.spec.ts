import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PromotionsService } from '../promotions.service';
import { Promotion } from '../entities/promotion.entity';

const now = new Date();
const future = new Date(Date.now() + 86400000 * 7);
const past = new Date(Date.now() - 86400000);

function makePromo(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: 'promo-1',
    name: 'Summer Sale',
    description: null,
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderAmount: null,
    usageLimit: null,
    usageCount: 0,
    startsAt: past,
    endsAt: future,
    isActive: true,
    applicableCategories: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Promotion;
}

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  increment: jest.fn(),
};

describe('PromotionsService', () => {
  let service: PromotionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: getRepositoryToken(Promotion), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(PromotionsService);
  });

  describe('create', () => {
    it('throws BadRequestException when endsAt <= startsAt', async () => {
      await expect(
        service.create({
          name: 'Bad',
          discountType: 'percentage',
          discountValue: 10,
          startsAt: future.toISOString(),
          endsAt: past.toISOString(),
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('saves and returns new promotion', async () => {
      const promo = makePromo();
      mockRepo.create.mockReturnValue(promo);
      mockRepo.save.mockResolvedValue(promo);

      const result = await service.create({
        name: 'Summer Sale',
        discountType: 'percentage',
        discountValue: 20,
        startsAt: past.toISOString(),
        endsAt: future.toISOString(),
      });
      expect(result.name).toBe('Summer Sale');
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    it('returns promotion when found', async () => {
      const promo = makePromo();
      mockRepo.findOne.mockResolvedValue(promo);
      expect(await service.findOne('promo-1')).toEqual(promo);
    });
  });

  describe('findActive', () => {
    it('returns active promotions array', async () => {
      const promos = [makePromo()];
      mockRepo.find.mockResolvedValue(promos);
      expect(await service.findActive()).toEqual(promos);
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      const promo = makePromo();
      mockRepo.findOne.mockResolvedValue(promo);
      mockRepo.save.mockResolvedValue({ ...promo, isActive: false });

      const result = await service.deactivate('promo-1');
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
    });
  });

  describe('applyToOrder', () => {
    it('returns invalid when promotion not active', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ isActive: false }));
      const result = await service.applyToOrder('promo-1', 5000);
      expect(result.valid).toBe(false);
      expect(result.discountAmountCents).toBe(0);
    });

    it('returns invalid when not yet started', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ startsAt: future }));
      const result = await service.applyToOrder('promo-1', 5000);
      expect(result.valid).toBe(false);
    });

    it('returns invalid when expired', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ endsAt: past }));
      const result = await service.applyToOrder('promo-1', 5000);
      expect(result.valid).toBe(false);
    });

    it('returns invalid when usage limit reached', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ usageLimit: 10, usageCount: 10 }));
      const result = await service.applyToOrder('promo-1', 5000);
      expect(result.valid).toBe(false);
    });

    it('returns invalid when order amount below minimum', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ minimumOrderAmount: 100 }));
      const result = await service.applyToOrder('promo-1', 5000);
      expect(result.valid).toBe(false);
    });

    it('computes percentage discount correctly', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ discountType: 'percentage', discountValue: 20 }));
      mockRepo.increment.mockResolvedValue({});
      const result = await service.applyToOrder('promo-1', 10000);
      expect(result.valid).toBe(true);
      expect(result.discountAmountCents).toBe(2000);
    });

    it('computes fixed discount correctly', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ discountType: 'fixed', discountValue: 15 }));
      mockRepo.increment.mockResolvedValue({});
      const result = await service.applyToOrder('promo-1', 10000);
      expect(result.valid).toBe(true);
      expect(result.discountAmountCents).toBe(1500);
    });

    it('caps discount at order amount', async () => {
      mockRepo.findOne.mockResolvedValue(makePromo({ discountType: 'fixed', discountValue: 200 }));
      mockRepo.increment.mockResolvedValue({});
      const result = await service.applyToOrder('promo-1', 5000);
      expect(result.discountAmountCents).toBe(5000);
    });
  });
});
