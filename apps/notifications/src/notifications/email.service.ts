import { Injectable, Logger } from '@nestjs/common';
import type { OrderPlacedEvent, OrderPaidEvent, OrderShippedEvent } from '@nextcommerce/shared';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(payload: EmailPayload): Promise<void> {
    this.logger.log({ to: payload.to, subject: payload.subject }, '[EMAIL MOCK] Sending email');
  }

  async sendOrderPlaced(payload: OrderPlacedEvent): Promise<void> {
    await this.sendEmail({
      to: `user-${payload.userId}@nextcommerce.dev`,
      subject: `Order Confirmed #${payload.orderId.slice(-8).toUpperCase()}`,
      body: `Your order has been confirmed for $${(payload.totalCents / 100).toFixed(2)}. We'll notify you when it ships.`,
    });
  }

  async sendOrderPaid(payload: OrderPaidEvent): Promise<void> {
    await this.sendEmail({
      to: `user-${payload.userId}@nextcommerce.dev`,
      subject: `Payment Confirmed — Order #${payload.orderId.slice(-8).toUpperCase()}`,
      body: `Payment received for your order. We are now processing your items.`,
    });
  }

  async sendOrderShipped(payload: OrderShippedEvent): Promise<void> {
    await this.sendEmail({
      to: `user-${payload.userId}@nextcommerce.dev`,
      subject: `Your Order Has Shipped!`,
      body: `Order #${payload.orderId.slice(-8).toUpperCase()} is on its way.${
        payload.trackingNumber ? ` Tracking: ${payload.trackingNumber}` : ''
      }`,
    });
  }

  async sendNewsletterWelcome(email: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to NextCommerce Newsletter!',
      body: 'Thanks for subscribing! You\'ll receive exclusive deals and product launches.',
    });
  }

  async sendOrderConfirmation(to: string, orderId: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Order Confirmed #${orderId.slice(-8).toUpperCase()}`,
      body: `Your order has been confirmed.`,
    });
  }

  async sendShippingNotification(to: string, orderId: string, trackingNumber?: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Your Order Has Shipped!`,
      body: `Order #${orderId.slice(-8).toUpperCase()} is on its way.${
        trackingNumber ? ` Tracking: ${trackingNumber}` : ''
      }`,
    });
  }

  async sendPaymentConfirmation(to: string, orderId: string, amountCents: number): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Payment Confirmed for Order #${orderId.slice(-8).toUpperCase()}`,
      body: `Payment of $${(amountCents / 100).toFixed(2)} received.`,
    });
  }
}
