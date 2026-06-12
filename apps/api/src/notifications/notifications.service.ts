import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationsBus } from './notifications.bus';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly bus: NotificationsBus,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.repo.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      actionUrl: dto.actionUrl ?? null,
      payload: dto.payload ?? null,
      isRead: false,
    });
    const saved = await this.repo.save(notification);
    this.bus.emit({
      userId: saved.userId,
      notification: {
        id: saved.id,
        type: saved.type,
        title: saved.title,
        body: saved.body,
        actionUrl: saved.actionUrl,
        createdAt: saved.createdAt,
      },
    });
    return saved;
  }

  async findForUser(
    userId: string,
    limit = 30,
  ): Promise<{ data: Notification[]; unreadCount: number }> {
    const data = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const unreadCount = data.filter((n) => !n.isRead).length;
    return { data, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, isRead: false } });
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await this.repo.delete({ id, userId });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }

  async notifyOrderPlaced(userId: string, orderId: string, orderNumber: string): Promise<void> {
    await this.create({
      userId,
      type: 'order_placed',
      title: 'Order Confirmed',
      body: `Your order #${orderNumber} has been placed successfully.`,
      actionUrl: `/account/orders/${orderId}`,
    });
  }

  async notifyOrderShipped(
    userId: string,
    orderId: string,
    orderNumber: string,
    trackingNumber?: string,
  ): Promise<void> {
    const trackingInfo = trackingNumber ? ` Tracking: ${trackingNumber}` : '';
    await this.create({
      userId,
      type: 'order_shipped',
      title: 'Order Shipped',
      body: `Order #${orderNumber} is on its way!${trackingInfo}`,
      actionUrl: `/account/orders/${orderId}`,
    });
  }

  async notifyLoyaltyPoints(userId: string, points: number, tier?: string): Promise<void> {
    await this.create({
      userId,
      type: 'loyalty_points',
      title: 'Loyalty Points Earned',
      body: `You earned ${points.toLocaleString()} points${tier ? ` (${tier} tier)` : ''}.`,
      actionUrl: '/account/loyalty',
    });
  }

  async notifyTierUpgrade(userId: string, newTier: string): Promise<void> {
    await this.create({
      userId,
      type: 'loyalty_tier_up',
      title: `Welcome to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}!`,
      body: `Congratulations! You've been upgraded to ${newTier} tier. Enjoy exclusive benefits.`,
      actionUrl: '/account/loyalty',
    });
  }

  async notifyPriceDrop(
    userId: string,
    productTitle: string,
    productSlug: string,
    newPriceCents: number,
  ): Promise<void> {
    const price = (newPriceCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    await this.create({
      userId,
      type: 'price_drop',
      title: 'Price Drop Alert',
      body: `${productTitle} is now ${price}. Grab it before it sells out!`,
      actionUrl: `/products/${productSlug}`,
    });
  }

  async notifyBackInStock(userId: string, productTitle: string, productSlug: string): Promise<void> {
    await this.create({
      userId,
      type: 'back_in_stock',
      title: 'Back in Stock',
      body: `${productTitle} is back in stock. Order now!`,
      actionUrl: `/products/${productSlug}`,
    });
  }

  async broadcastToUsers(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
    actionUrl?: string,
  ): Promise<number> {
    if (userIds.length === 0) return 0;
    const notifications = userIds.map((userId) =>
      this.repo.create({ userId, type, title, body, actionUrl: actionUrl ?? null, isRead: false }),
    );
    await this.repo.save(notifications);
    return notifications.length;
  }

  async getAdminStats(): Promise<{
    total: number;
    unread: number;
    readRate: number;
    byType: Array<{ type: string; count: number }>;
  }> {
    const total = await this.repo.count();
    const unread = await this.repo.count({ where: { isRead: false } });
    const readRate = total > 0 ? Math.round(((total - unread) / total) * 100) : 0;

    const rows = await this.repo
      .createQueryBuilder('n')
      .select('n.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('n.type')
      .orderBy('count', 'DESC')
      .getRawMany<{ type: string; count: string }>();

    return {
      total,
      unread,
      readRate,
      byType: rows.map((r) => ({ type: r.type, count: Number(r.count) })),
    };
  }
}
