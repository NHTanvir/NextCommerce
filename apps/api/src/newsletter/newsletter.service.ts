import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly subRepo: Repository<NewsletterSubscription>,
  ) {}

  async subscribe(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.subRepo.findOne({ where: { email: normalizedEmail } });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('This email is already subscribed');
      }
      await this.subRepo.update(existing.id, {
        isActive: true,
        unsubscribeToken: randomBytes(32).toString('hex'),
      });
      return { message: 'Welcome back! Your subscription has been reactivated.' };
    }

    await this.subRepo.save(
      this.subRepo.create({
        email: normalizedEmail,
        unsubscribeToken: randomBytes(32).toString('hex'),
      }),
    );

    return { message: 'Thank you for subscribing to NextCommerce updates!' };
  }

  async unsubscribe(token: string): Promise<{ message: string }> {
    const sub = await this.subRepo.findOne({ where: { unsubscribeToken: token } });
    if (!sub) return { message: 'Subscription not found or already unsubscribed.' };

    await this.subRepo.update(sub.id, { isActive: false, unsubscribeToken: null });
    return { message: 'You have been successfully unsubscribed.' };
  }

  async getActiveCount(): Promise<number> {
    return this.subRepo.count({ where: { isActive: true } });
  }

  async findAll(page = 1, limit = 50): Promise<{ data: NewsletterSubscription[]; total: number; activeCount: number }> {
    const [data, total] = await this.subRepo.findAndCount({
      order: { subscribedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const activeCount = await this.subRepo.count({ where: { isActive: true } });
    return { data, total, activeCount };
  }

  async exportEmails(): Promise<string> {
    const subs = await this.subRepo.find({
      where: { isActive: true },
      order: { subscribedAt: 'ASC' },
      select: ['email', 'subscribedAt'],
    });
    const header = 'Email,Subscribed At';
    const rows = subs.map((s) => `${s.email},${s.subscribedAt.toISOString()}`);
    return [header, ...rows].join('\n');
  }
}
