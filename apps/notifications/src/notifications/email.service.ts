import { Injectable, Logger } from '@nestjs/common';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(payload: EmailPayload): Promise<void> {
    this.logger.log(
      {
        to: payload.to,
        subject: payload.subject,
      },
      `[EMAIL MOCK] Sending email`,
    );
  }

  async sendOrderConfirmation(to: string, orderId: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Order Confirmed #${orderId.slice(-8).toUpperCase()}`,
      body: `Your order has been confirmed. We'll notify you when it ships.`,
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
