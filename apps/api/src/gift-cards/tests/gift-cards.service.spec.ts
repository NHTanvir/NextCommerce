import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GiftCardsService } from '../gift-cards.service';
import { GiftCard } from '../entities/gift-card.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

function makeCard(overrides: Partial<GiftCard> = {}): GiftCard {
  return {
    id: 'gc-1',
    code: 'ABCD-1234-EFGH-5678',
    initialAmountCents: 5000,
    remainingAmountCents: 5000,
    isActive: true,
    purchasedByUserId: 'user-1',
    redeemedByUserId: null,
    recipientEmail: null,
    recipientName: null,
    message: null,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    ...overrides,
  } as GiftCard;
}

describe('GiftCardsService', () => {
  let service: GiftCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftCardsService,
        { provide: getRepositoryToken(GiftCard), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GiftCardsService>(GiftCardsService);
    jest.clearAllMocks();
  });

  describe('purchase', () => {
    it('creates a card with correct amount and generated code', async () => {
      const card = makeCard();
      mockRepo.create.mockReturnValue(card);
      mockRepo.save.mockResolvedValue(card);

      const result = await service.purchase('user-1', { amountCents: 5000 });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          initialAmountCents: 5000,
          remainingAmountCents: 5000,
          purchasedByUserId: 'user-1',
          isActive: true,
        }),
      );
      expect(result).toEqual(card);
    });

    it('stores recipient info when provided', async () => {
      const card = makeCard({ recipientEmail: 'gift@test.com', recipientName: 'Jane' });
      mockRepo.create.mockReturnValue(card);
      mockRepo.save.mockResolvedValue(card);

      await service.purchase('user-1', {
        amountCents: 2500,
        recipientEmail: 'gift@test.com',
        recipientName: 'Jane',
        message: 'Happy birthday!',
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmail: 'gift@test.com',
          recipientName: 'Jane',
          message: 'Happy birthday!',
        }),
      );
    });
  });

  describe('getBalance', () => {
    it('returns invalid for unknown code', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getBalance('BAD-CODE');

      expect(result.isValid).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('returns valid for active card with balance', async () => {
      const card = makeCard({ remainingAmountCents: 3000 });
      mockRepo.findOne.mockResolvedValue(card);

      const result = await service.getBalance('ABCD-1234-EFGH-5678');

      expect(result.isValid).toBe(true);
      expect(result.remaining).toBe(3000);
    });

    it('returns invalid for inactive card', async () => {
      const card = makeCard({ isActive: false });
      mockRepo.findOne.mockResolvedValue(card);

      const result = await service.getBalance('ABCD-1234-EFGH-5678');

      expect(result.isValid).toBe(false);
    });

    it('returns invalid for expired card', async () => {
      const card = makeCard({ expiresAt: new Date(Date.now() - 1000) });
      mockRepo.findOne.mockResolvedValue(card);

      const result = await service.getBalance('ABCD-1234-EFGH-5678');

      expect(result.isValid).toBe(false);
    });
  });

  describe('applyToOrder', () => {
    it('throws NotFoundException for unknown code', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.applyToOrder('BAD', 'user-1', 5000)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for inactive card', async () => {
      mockRepo.findOne.mockResolvedValue(makeCard({ isActive: false }));

      await expect(service.applyToOrder('CODE', 'user-1', 5000)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for expired card', async () => {
      mockRepo.findOne.mockResolvedValue(makeCard({ expiresAt: new Date(Date.now() - 1) }));

      await expect(service.applyToOrder('CODE', 'user-1', 5000)).rejects.toThrow(BadRequestException);
    });

    it('applies full card balance when less than order amount', async () => {
      const card = makeCard({ remainingAmountCents: 2000 });
      mockRepo.findOne.mockResolvedValue(card);
      mockRepo.update.mockResolvedValue({});

      const result = await service.applyToOrder('ABCD-1234-EFGH-5678', 'user-1', 10000);

      expect(result.discountCents).toBe(2000);
      expect(result.remainingAfter).toBe(0);
    });

    it('applies partial card balance when card exceeds order amount', async () => {
      const card = makeCard({ remainingAmountCents: 5000 });
      mockRepo.findOne.mockResolvedValue(card);
      mockRepo.update.mockResolvedValue({});

      const result = await service.applyToOrder('ABCD-1234-EFGH-5678', 'user-1', 2000);

      expect(result.discountCents).toBe(2000);
      expect(result.remainingAfter).toBe(3000);
    });

    it('marks card inactive when fully depleted', async () => {
      const card = makeCard({ remainingAmountCents: 2000 });
      mockRepo.findOne.mockResolvedValue(card);
      mockRepo.update.mockResolvedValue({});

      await service.applyToOrder('ABCD-1234-EFGH-5678', 'user-1', 2000);

      expect(mockRepo.update).toHaveBeenCalledWith(
        'gc-1',
        expect.objectContaining({ isActive: false, remainingAmountCents: 0 }),
      );
    });
  });

  describe('deactivate', () => {
    it('throws NotFoundException for unknown card', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.deactivate('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('deactivates the card', async () => {
      const card = makeCard();
      mockRepo.findOne.mockResolvedValue(card);
      mockRepo.update.mockResolvedValue({});

      await service.deactivate('gc-1');

      expect(mockRepo.update).toHaveBeenCalledWith('gc-1', { isActive: false });
    });
  });
});
