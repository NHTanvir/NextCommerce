import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import type { OrderPlacedEvent, OrderPaidEvent, OrderShippedEvent } from '@nextcommerce/shared';

const EXCHANGE = 'nextcommerce.events';

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
    try {
      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(EXCHANGE, 'fanout', { durable: true });

      const q = await this.channel.assertQueue('notifications.service', { durable: true });
      await this.channel.bindQueue(q.queue, EXCHANGE, '');

      this.channel.consume(q.queue, (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          this.handleEvent(event);
          this.channel!.ack(msg);
        } catch (err) {
          this.logger.error({ err }, 'Failed to process message');
          this.channel!.nack(msg, false, false);
        }
      });

      this.logger.log('Connected to RabbitMQ and consuming events');
    } catch (err) {
      this.logger.warn({ err }, 'RabbitMQ unavailable — notifications service running in degraded mode');
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private handleEvent(event: { type: string; payload: unknown }) {
    switch (event.type) {
      case 'order.placed':
        this.onOrderPlaced(event.payload as OrderPlacedEvent);
        break;
      case 'order.paid':
        this.onOrderPaid(event.payload as OrderPaidEvent);
        break;
      case 'order.shipped':
        this.onOrderShipped(event.payload as OrderShippedEvent);
        break;
      default:
        this.logger.debug({ type: event.type }, 'Unknown event type — skipping');
    }
  }

  private onOrderPlaced(payload: OrderPlacedEvent) {
    this.logger.log(
      { orderId: payload.orderId, userId: payload.userId },
      `[EMAIL] Order placed — sending confirmation to user ${payload.userId}`,
    );
  }

  private onOrderPaid(payload: OrderPaidEvent) {
    this.logger.log(
      { orderId: payload.orderId },
      `[EMAIL] Payment confirmed for order ${payload.orderId}`,
    );
  }

  private onOrderShipped(payload: OrderShippedEvent) {
    this.logger.log(
      { orderId: payload.orderId, trackingNumber: payload.trackingNumber },
      `[EMAIL] Shipping notification — tracking: ${payload.trackingNumber}`,
    );
  }
}
