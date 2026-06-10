import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import type { UserPayload } from '@nextcommerce/shared';

const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockNotif = { id: 'n-1', userId: 'user-1', title: 'Order shipped', isRead: false };

const mockService: Partial<NotificationsService> = {
  findForUser: jest.fn().mockResolvedValue([mockNotif]),
  getUnreadCount: jest.fn().mockResolvedValue(3),
  markAsRead: jest.fn().mockResolvedValue(undefined),
  markAllAsRead: jest.fn().mockResolvedValue(undefined),
  deleteNotification: jest.fn().mockResolvedValue(undefined),
  deleteAllForUser: jest.fn().mockResolvedValue(undefined),
  getAdminStats: jest.fn().mockResolvedValue({ total: 200, unread: 50 }),
  broadcastToUsers: jest.fn().mockResolvedValue(5),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();

    controller = module.get(NotificationsController);
    jest.clearAllMocks();
  });

  it('findForUser() uses default limit of 30', async () => {
    await controller.findForUser(user);
    expect(mockService.findForUser).toHaveBeenCalledWith('user-1', 30);
  });

  it('findForUser() parses limit string', async () => {
    await controller.findForUser(user, '10');
    expect(mockService.findForUser).toHaveBeenCalledWith('user-1', 10);
  });

  it('getUnreadCount() wraps result in { count }', async () => {
    const result = await controller.getUnreadCount(user);
    expect(result).toEqual({ count: 3 });
    expect(mockService.getUnreadCount).toHaveBeenCalledWith('user-1');
  });

  it('markAsRead() delegates id and user sub', async () => {
    await controller.markAsRead('n-1', user);
    expect(mockService.markAsRead).toHaveBeenCalledWith('n-1', 'user-1');
  });

  it('markAllAsRead() delegates user sub', async () => {
    await controller.markAllAsRead(user);
    expect(mockService.markAllAsRead).toHaveBeenCalledWith('user-1');
  });

  it('deleteOne() delegates id and user sub', async () => {
    await controller.deleteOne('n-1', user);
    expect(mockService.deleteNotification).toHaveBeenCalledWith('n-1', 'user-1');
  });

  it('deleteAll() delegates user sub', async () => {
    await controller.deleteAll(user);
    expect(mockService.deleteAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('getAdminStats() delegates to service', async () => {
    const result = await controller.getAdminStats();
    expect(mockService.getAdminStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });

  it('broadcast() wraps sent count in { sent }', async () => {
    const dto = { userIds: ['u-1'], type: 'order' as any, title: 'Hello', body: 'World' };
    const result = await controller.broadcast(dto);
    expect(mockService.broadcastToUsers).toHaveBeenCalledWith(['u-1'], 'order', 'Hello', 'World', undefined);
    expect(result).toEqual({ sent: 5 });
  });
});
