import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';
import { PriceAlert } from './entities/price-alert.entity';

export class CreatePriceAlertDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  targetPriceCents?: number;
}

@Injectable()
export class PriceAlertsService {
  constructor(
    @InjectRepository(PriceAlert)
    private readonly repo: Repository<PriceAlert>,
  ) {}

  async subscribe(userId: string, dto: CreatePriceAlertDto): Promise<PriceAlert> {
    const existing = await this.repo.findOne({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      if (!existing.isActive) {
        await this.repo.update(existing.id, {
          isActive: true,
          targetPriceCents: dto.targetPriceCents ?? null,
        });
        return this.repo.findOne({ where: { id: existing.id } }) as Promise<PriceAlert>;
      }
      throw new ConflictException('You already have an alert for this product.');
    }

    const alert = this.repo.create({
      userId,
      productId: dto.productId,
      targetPriceCents: dto.targetPriceCents ?? null,
      isActive: true,
      lastTriggeredAt: null,
    });

    return this.repo.save(alert);
  }

  async unsubscribe(userId: string, productId: string): Promise<void> {
    const alert = await this.repo.findOne({ where: { userId, productId } });
    if (!alert) throw new NotFoundException('Price alert not found.');
    await this.repo.update(alert.id, { isActive: false });
  }

  async findForUser(userId: string): Promise<PriceAlert[]> {
    return this.repo.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findForProduct(productId: string): Promise<PriceAlert[]> {
    return this.repo.find({
      where: { productId, isActive: true },
    });
  }

  async getAlert(userId: string, productId: string): Promise<PriceAlert | null> {
    return this.repo.findOne({ where: { userId, productId, isActive: true } });
  }

  async markTriggered(alertId: string): Promise<void> {
    await this.repo.update(alertId, { lastTriggeredAt: new Date(), isActive: false });
  }

  async shouldTrigger(alert: PriceAlert, currentPriceCents: number): boolean {
    if (!alert.isActive) return false;
    if (alert.targetPriceCents === null) return true;
    return currentPriceCents <= alert.targetPriceCents;
  }
}
