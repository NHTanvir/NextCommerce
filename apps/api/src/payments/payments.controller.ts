import {
  Controller,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import type { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', 'whsec_test');
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));

    const valid = this.paymentsService.verifyWebhookSignature(rawBody, signature ?? '', secret);
    if (!valid) {
      this.logger.warn('Stripe webhook signature verification failed');
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    await this.paymentsService.handleStripeWebhook(event);
    return { received: true };
  }
}
