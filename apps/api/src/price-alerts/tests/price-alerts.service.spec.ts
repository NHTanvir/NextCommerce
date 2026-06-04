import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PriceAlertsService } from '../price-alerts.service';
import { PriceAlert } from '../entities/price-alert.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

function makeAlert(overrides: Partial<PriceAlert> = {}): PriceAlert {
  return {
    id: 'a-1',
    userId: 'user-1',
    productId: 'p-1',
    targetPriceCents: null,
    isActive: true,
    lastTriggeredAt: null,
    createdAt: new Date(),
    ...overrides,
  } as PriceAlert;
}

describe('PriceAlertsService', () => {
  let service: PriceAlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceAlertsService,
        { provide: getRepositoryToken(PriceAlert), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PriceAlertsService>(PriceAlertsService);
    jest.clearAllMocks();
  });

  describe('subscribe', () => {
    it('creates a new alert when none exists', async () => {
      const alert = makeAlert();
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(alert);
      mockRepo.save.mockResolvedValue(alert);

      const result = await service.subscribe('user-1', { productId: 'p-1' });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', productId: 'p-1', isActive: true }),
      );
      expect(result).toEqual(alert);
    });

    it('stores targetPriceCents when provided', async () => {
      const alert = makeAlert({ targetPriceCents: 5000 });
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(alert);
      mockRepo.save.mockResolvedValue(alert);

      await service.subscribe('user-1', { productId: 'p-1', targetPriceCents: 5000 });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ targetPriceCents: 5000 }),
      );
    });

    it('throws ConflictException when active alert already exists', async () => {
      mockRepo.findOne.mockResolvedValue(makeAlert({ isActive: true }));

      await expect(
        service.subscribe('user-1', { productId: 'p-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('reactivates inactive alert instead of creating duplicate', async () => {
      const inactive = makeAlert({ isActive: false });
      const reactivated = makeAlert({ isActive: true });
      mockRepo.findOne.mockResolvedValueOnce(inactive).mockResolvedValueOnce(reactivated);
      mockRepo.update.mockResolvedValue({});

      const result = await service.subscribe('user-1', { productId: 'p-1' });

      expect(mockRepo.update).toHaveBeenCalledWith(
        inactive.id,
        expect.objectContaining({ isActive: true }),
      );
      expect(result).toEqual(reactivated);
    });
  });

  describe('unsubscribe', () => {
    it('sets isActive=false for existing alert', async () => {
      const alert = makeAlert();
      mockRepo.findOne.mockResolvedValue(alert);
      mockRepo.update.mockResolvedValue({});

      await service.unsubscribe('user-1', 'p-1');

      expect(mockRepo.update).toHaveBeenCalledWith(alert.id, { isActive: false });
    });

    it('throws NotFoundException when alert does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.unsubscribe('user-1', 'p-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findForUser', () => {
    it('returns only active alerts ordered by createdAt', async () => {
      const alerts = [makeAlert()];
      mockRepo.find.mockResolvedValue(alerts);

      const result = await service.findForUser('user-1');

      expect(result).toEqual(alerts);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', isActive: true },
          order: { createdAt: 'DESC' },
        }),
      );
    });
  });

  describe('shouldTrigger', () => {
    it('returns false for inactive alerts', () => {
      const alert = makeAlert({ isActive: false });
      expect(service.shouldTrigger(alert, 4999)).toBe(false);
    });

    it('returns true when alert has no target price (any price drop)', () => {
      const alert = makeAlert({ targetPriceCents: null });
      expect(service.shouldTrigger(alert, 9999)).toBe(true);
    });

    it('returns true when current price is at or below target', () => {
      const alert = makeAlert({ targetPriceCents: 5000 });
      expect(service.shouldTrigger(alert, 5000)).toBe(true);
      expect(service.shouldTrigger(alert, 4999)).toBe(true);
    });

    it('returns false when current price is above target', () => {
      const alert = makeAlert({ targetPriceCents: 5000 });
      expect(service.shouldTrigger(alert, 5001)).toBe(false);
    });
  });

  describe('markTriggered', () => {
    it('sets lastTriggeredAt and deactivates alert', async () => {
      mockRepo.update.mockResolvedValue({});

      await service.markTriggered('a-1');

      expect(mockRepo.update).toHaveBeenCalledWith(
        'a-1',
        expect.objectContaining({ isActive: false }),
      );
    });
  });
});
