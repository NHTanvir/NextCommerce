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

  shouldTrigger(alert: PriceAlert, currentPriceCents: number): boolean {
    if (!alert.isActive) return false;
    if (alert.targetPriceCents === null) return true;
    return currentPriceCents <= alert.targetPriceCents;
  }

  async findAll(page = 1, limit = 30): Promise<{ data: PriceAlert[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getAdminStats(): Promise<{
    total: number;
    active: number;
    triggered: number;
    withTarget: number;
    withoutTarget: number;
  }> {
    const row = await this.repo
      .createQueryBuilder('pa')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN pa.isActive = 1 THEN 1 ELSE 0 END)', 'active')
      .addSelect('SUM(CASE WHEN pa.lastTriggeredAt IS NOT NULL THEN 1 ELSE 0 END)', 'triggered')
      .addSelect('SUM(CASE WHEN pa.targetPriceCents IS NOT NULL THEN 1 ELSE 0 END)', 'withTarget')
      .addSelect('SUM(CASE WHEN pa.targetPriceCents IS NULL THEN 1 ELSE 0 END)', 'withoutTarget')
      .getRawOne();
    return {
      total: Number(row.total) || 0,
      active: Number(row.active) || 0,
      triggered: Number(row.triggered) || 0,
      withTarget: Number(row.withTarget) || 0,
      withoutTarget: Number(row.withoutTarget) || 0,
    };
  }
}
