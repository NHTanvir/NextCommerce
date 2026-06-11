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

describe('OrdersService notification preferences', () => {
  let service: OrdersService;
  const notifyShipped = jest.fn();
  const shouldSendEmail = jest.fn();

  const orderRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: {} },
        { provide: getRepositoryToken(Address), useValue: {} },
        { provide: CartService, useValue: {} },
        { provide: CatalogService, useValue: {} },
        { provide: EventsService, useValue: { publish: jest.fn() } },
        { provide: NotificationsService, useValue: { notifyOrderShipped: notifyShipped } },
        { provide: NotificationPreferencesService, useValue: { shouldSendEmail } },
        { provide: MetricsService, useValue: { observeCheckout: jest.fn() } },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get(OrdersService);
    jest.clearAllMocks();
  });

  function setOrder(status: string) {
    orderRepo.findOne.mockResolvedValue({
      id: 'o-1',
      userId: 'u-1',
      status,
    });
    orderRepo.update.mockResolvedValue({});
  }

  it('skips shipped notification when user opted out of orderUpdates', async () => {
    setOrder('processing');
    shouldSendEmail.mockReturnValue(false);

    await service.updateStatus('o-1', 'shipped', 'admin-1', '1Z-TRACK', 'UPS');

    expect(shouldSendEmail).toHaveBeenCalledWith('u-1', 'orderUpdates');
    expect(notifyShipped).not.toHaveBeenCalled();
  });

  it('sends shipped notification when user opted in', async () => {
    setOrder('processing');
    shouldSendEmail.mockReturnValue(true);

    await service.updateStatus('o-1', 'shipped', 'admin-1', '1Z-TRACK', 'UPS');

    expect(notifyShipped).toHaveBeenCalledWith(
      'u-1',
      'o-1',
      expect.any(String),
      '1Z-TRACK',
    );
  });
});
