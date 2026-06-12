import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(EventsService.name);
  private readonly exchange = 'nextcommerce.events';

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    try {
      const url = this.config.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      this.logger.log('Connected to RabbitMQ');
    } catch (err) {
      this.logger.warn(`RabbitMQ unavailable — events will be logged only: ${err}`);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  isConnected(): boolean {
    return this.channel !== null && this.connection !== null;
  }

  async publish(eventName: string, payload: Record<string, unknown>): Promise<void> {
    const message = JSON.stringify({ event: eventName, payload, timestamp: new Date().toISOString() });

    if (this.channel) {
      this.channel.publish(this.exchange, eventName, Buffer.from(message), { persistent: true });
      this.logger.log(`Published: ${eventName}`);
    } else {
      this.logger.warn(`[EVENT FALLBACK] ${eventName}: ${message}`);
    }
  }
}
