import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { NewsletterService } from '../newsletter.service';
import { NewsletterSubscription } from '../entities/newsletter-subscription.entity';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

const activeSub: NewsletterSubscription = {
  id: 's1',
  email: 'user@example.com',
  isActive: true,
  unsubscribeToken: 'old-token',
  subscribedAt: new Date(),
} as unknown as NewsletterSubscription;

describe('NewsletterService', () => {
  let service: NewsletterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: getRepositoryToken(NewsletterSubscription), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
    jest.clearAllMocks();
  });

  describe('subscribe', () => {
    it('creates a new subscription for unknown email', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const sub = { email: 'new@example.com' };
      mockRepo.create.mockReturnValue(sub);
      mockRepo.save.mockResolvedValue(sub);

      const result = await service.subscribe('new@example.com');

      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.message).toMatch(/thank you/i);
    });

    it('throws ConflictException if email already active', async () => {
      mockRepo.findOne.mockResolvedValue(activeSub);
      await expect(service.subscribe('user@example.com')).rejects.toThrow(ConflictException);
    });

    it('reactivates inactive subscription', async () => {
      const inactiveSub = { ...activeSub, isActive: false };
      mockRepo.findOne.mockResolvedValue(inactiveSub);
      mockRepo.update.mockResolvedValue({});

      const result = await service.subscribe('user@example.com');

      expect(mockRepo.update).toHaveBeenCalledWith('s1', expect.objectContaining({ isActive: true }));
      expect(result.message).toMatch(/reactivated/i);
    });

    it('normalizes email to lowercase', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockResolvedValue({});

      await service.subscribe('User@Example.COM');

      expect(mockRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'user@example.com' } }),
      );
    });
  });

  describe('unsubscribe', () => {
    it('deactivates subscription by token', async () => {
      mockRepo.findOne.mockResolvedValue(activeSub);
      mockRepo.update.mockResolvedValue({});

      const result = await service.unsubscribe('old-token');

      expect(mockRepo.update).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({ isActive: false, unsubscribeToken: null }),
      );
      expect(result.message).toMatch(/unsubscribed/i);
    });

    it('gracefully handles unknown token', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.unsubscribe('bad-token');
      expect(result.message).toMatch(/not found/i);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('getActiveCount', () => {
    it('returns count of active subscriptions', async () => {
      mockRepo.count.mockResolvedValue(42);
      const count = await service.getActiveCount();
      expect(count).toBe(42);
      expect(mockRepo.count).toHaveBeenCalledWith({ where: { isActive: true } });
    });
  });
});
