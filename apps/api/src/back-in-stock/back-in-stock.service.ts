import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackInStockSubscription } from './entities/back-in-stock.entity';

@Injectable()
export class BackInStockService {
  constructor(
    @InjectRepository(BackInStockSubscription)
    private readonly repo: Repository<BackInStockSubscription>,
  ) {}

  async subscribe(userId: string, variantId: string, productId: string): Promise<BackInStockSubscription> {
    const existing = await this.repo.findOne({ where: { userId, variantId } });

    if (existing) {
      if (!existing.notified) {
        throw new ConflictException('You are already subscribed to this item.');
      }
      await this.repo.update(existing.id, { notified: false, notifiedAt: null });
      return this.repo.findOne({ where: { id: existing.id } }) as Promise<BackInStockSubscription>;
    }

    const sub = this.repo.create({
      userId,
      variantId,
      productId,
      notified: false,
      notifiedAt: null,
    });

    return this.repo.save(sub);
  }

  async unsubscribe(userId: string, variantId: string): Promise<void> {
    const sub = await this.repo.findOne({ where: { userId, variantId } });
    if (!sub) throw new NotFoundException('Subscription not found.');
    await this.repo.remove(sub);
  }

  async findForUser(userId: string): Promise<BackInStockSubscription[]> {
    return this.repo.find({
      where: { userId, notified: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingForVariant(variantId: string): Promise<BackInStockSubscription[]> {
    return this.repo.find({ where: { variantId, notified: false } });
  }

  async markAllNotified(variantId: string): Promise<number> {
    const result = await this.repo.update(
      { variantId, notified: false },
      { notified: true, notifiedAt: new Date() },
    );
    return result.affected ?? 0;
  }

  async hasSubscription(userId: string, variantId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, variantId, notified: false } });
    return count > 0;
  }

  async countPending(variantId: string): Promise<number> {
    return this.repo.count({ where: { variantId, notified: false } });
  }

  async findAll(page = 1, limit = 30): Promise<{ data: BackInStockSubscription[]; total: number; pendingCount: number }> {
    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const pendingCount = await this.repo.count({ where: { notified: false } });
    return { data, total, pendingCount };
  }
}
