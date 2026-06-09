import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events.service';

const mockChannel = {
  publish: jest.fn(),
  close: jest.fn().mockResolvedValue(undefined),
  assertExchange: jest.fn().mockResolvedValue(undefined),
};

const mockConnection = {
  createChannel: jest.fn().mockResolvedValue(mockChannel),
  close: jest.fn().mockResolvedValue(undefined),
};

jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue(mockConnection),
}));

import * as amqp from 'amqplib';

describe('EventsService', () => {
  let service: EventsService;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = { get: jest.fn().mockReturnValue('amqp://localhost') } as unknown as ConfigService;
    service = new EventsService(configService);
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => {});
  });

  describe('onModuleInit()', () => {
    it('connects to RabbitMQ and asserts exchange', async () => {
      await service.onModuleInit();
      expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost');
      expect(mockChannel.assertExchange).toHaveBeenCalledWith('nextcommerce.events', 'topic', { durable: true });
    });

    it('falls back gracefully when RabbitMQ is unavailable', async () => {
      (amqp.connect as jest.Mock).mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('publish()', () => {
    it('publishes to exchange when channel is available', async () => {
      await service.onModuleInit();
      await service.publish('order.created', { orderId: 'abc' });
      expect(mockChannel.publish).toHaveBeenCalledWith(
        'nextcommerce.events',
        'order.created',
        expect.any(Buffer),
        { persistent: true },
      );
    });

    it('logs a warning instead of throwing when no channel', async () => {
      await service.publish('order.created', { orderId: 'abc' });
      expect(mockChannel.publish).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy()', () => {
    it('closes channel and connection', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('does not throw when channel/connection are null', async () => {
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
