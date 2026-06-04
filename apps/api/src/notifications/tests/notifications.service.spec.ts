import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from '../notifications.service';
import { Notification } from '../entities/notification.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n-1',
    userId: 'user-1',
    type: 'order_placed',
    title: 'Order Confirmed',
    body: 'Your order has been placed.',
    actionUrl: '/account/orders/o-1',
    isRead: false,
    createdAt: new Date(),
    ...overrides,
  } as Notification;
}

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('saves notification with isRead=false', async () => {
      const notification = makeNotification();
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      const result = await service.create({
        userId: 'user-1',
        type: 'order_placed',
        title: 'Order Confirmed',
        body: 'Your order has been placed.',
        actionUrl: '/account/orders/o-1',
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', isRead: false }),
      );
      expect(result).toEqual(notification);
    });

    it('sets actionUrl to null when not provided', async () => {
      const notification = makeNotification({ actionUrl: null });
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      await service.create({
        userId: 'user-1',
        type: 'system',
        title: 'System message',
        body: 'Some message.',
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ actionUrl: null }),
      );
    });
  });

  describe('findForUser', () => {
    it('returns notifications sorted by createdAt desc with unread count', async () => {
      const notifications = [
        makeNotification({ id: 'n-1', isRead: false }),
        makeNotification({ id: 'n-2', isRead: false }),
        makeNotification({ id: 'n-3', isRead: true }),
      ];
      mockRepo.find.mockResolvedValue(notifications);

      const result = await service.findForUser('user-1');

      expect(result.data).toEqual(notifications);
      expect(result.unreadCount).toBe(2);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          order: { createdAt: 'DESC' },
          take: 30,
        }),
      );
    });

    it('respects custom limit', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.findForUser('user-1', 10);

      expect(mockRepo.find).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
    });

    it('returns unreadCount=0 when all are read', async () => {
      mockRepo.find.mockResolvedValue([makeNotification({ isRead: true })]);

      const result = await service.findForUser('user-1');

      expect(result.unreadCount).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('calls update with isRead=true scoped to user', async () => {
      mockRepo.update.mockResolvedValue({});

      await service.markAsRead('n-1', 'user-1');

      expect(mockRepo.update).toHaveBeenCalledWith({ id: 'n-1', userId: 'user-1' }, { isRead: true });
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications for user', async () => {
      mockRepo.update.mockResolvedValue({});

      await service.markAllAsRead('user-1');

      expect(mockRepo.update).toHaveBeenCalledWith(
        { userId: 'user-1', isRead: false },
        { isRead: true },
      );
    });
  });

  describe('getUnreadCount', () => {
    it('returns count from repo', async () => {
      mockRepo.count.mockResolvedValue(5);

      const count = await service.getUnreadCount('user-1');

      expect(count).toBe(5);
      expect(mockRepo.count).toHaveBeenCalledWith({ where: { userId: 'user-1', isRead: false } });
    });
  });

  describe('deleteNotification', () => {
    it('deletes scoped to user', async () => {
      mockRepo.delete.mockResolvedValue({});

      await service.deleteNotification('n-1', 'user-1');

      expect(mockRepo.delete).toHaveBeenCalledWith({ id: 'n-1', userId: 'user-1' });
    });
  });

  describe('notifyOrderShipped', () => {
    it('creates shipped notification with tracking number', async () => {
      const notification = makeNotification({ type: 'order_shipped' });
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      await service.notifyOrderShipped('user-1', 'o-1', '#12345', '1Z999AA10123456784');

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order_shipped',
          body: expect.stringContaining('1Z999AA10123456784'),
        }),
      );
    });

    it('omits tracking info when not provided', async () => {
      const notification = makeNotification({ type: 'order_shipped' });
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      await service.notifyOrderShipped('user-1', 'o-1', '#12345');

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.not.stringContaining('Tracking:'),
        }),
      );
    });
  });

  describe('notifyLoyaltyPoints', () => {
    it('creates loyalty_points notification', async () => {
      const notification = makeNotification({ type: 'loyalty_points' });
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      await service.notifyLoyaltyPoints('user-1', 250, 'silver');

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'loyalty_points',
          body: expect.stringContaining('250'),
          actionUrl: '/account/loyalty',
        }),
      );
    });
  });

  describe('notifyTierUpgrade', () => {
    it('creates tier upgrade notification with capitalized tier name', async () => {
      const notification = makeNotification({ type: 'loyalty_tier_up' });
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      await service.notifyTierUpgrade('user-1', 'gold');

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'loyalty_tier_up',
          title: expect.stringContaining('Gold'),
        }),
      );
    });
  });

  describe('notifyPriceDrop', () => {
    it('creates price drop notification with formatted price', async () => {
      const notification = makeNotification({ type: 'price_drop' });
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      await service.notifyPriceDrop('user-1', 'Air Max 90', 'air-max-90', 8999);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'price_drop',
          body: expect.stringContaining('$89.99'),
          actionUrl: '/products/air-max-90',
        }),
      );
    });
  });
});
