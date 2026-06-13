import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrdersService } from '../orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Address } from '../entities/address.entity';
import { CartService } from '../../cart/cart.service';
import { CatalogService } from '../../catalog/catalog.service';
import { EventsService } from '../../events/events.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationPreferencesService } from '../../notification-preferences/notification-preferences.service';
import { MetricsService } from '../../metrics/metrics.service';

describe('OrdersService checkout latency metric', () => {
  let service: OrdersService;
  const observeCheckout = jest.fn();
  const cartService = { getOrCreate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(OrderItem), useValue: {} },
        { provide: getRepositoryToken(Address), useValue: {} },
        { provide: CartService, useValue: cartService },
        { provide: CatalogService, useValue: {} },
        { provide: EventsService, useValue: { publish: jest.fn() } },
        { provide: NotificationsService, useValue: {} },
        { provide: NotificationPreferencesService, useValue: { shouldSendEmail: jest.fn() } },
        { provide: MetricsService, useValue: { observeCheckout } },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get(OrdersService);
    jest.clearAllMocks();
  });

  it('observes checkout latency even when create() throws on empty cart', async () => {
    cartService.getOrCreate.mockResolvedValue({ items: [] });

    await expect(service.create('user-1', { addressId: 'a-1' } as any)).rejects.toThrow(
      'Cart is empty',
    );

    expect(observeCheckout).toHaveBeenCalledTimes(1);
    const duration = observeCheckout.mock.calls[0][0];
    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(duration).toBeLessThan(5);
  });
});
