import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, And } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

export interface ApplyResult {
  valid: boolean;
  discountAmountCents: number;
  message?: string;
}

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly repo: Repository<Promotion>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    if (new Date(dto.endsAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    const promo = this.repo.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(promo);
  }

  async findAll(): Promise<Promotion[]> {
    return this.repo.find({ order: { startsAt: 'DESC' } });
  }

  async findActive(): Promise<Promotion[]> {
    const now = new Date();
    return this.repo.find({
      where: {
        isActive: true,
        startsAt: LessThanOrEqual(now),
        endsAt: MoreThanOrEqual(now),
      },
      order: { discountValue: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Promotion> {
    const promo = await this.repo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException(`Promotion ${id} not found`);
    return promo;
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<Promotion> {
    const promo = await this.findOne(id);
    if (dto.startsAt) promo.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) promo.endsAt = new Date(dto.endsAt);
    if (promo.endsAt <= promo.startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    Object.assign(promo, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.discountType !== undefined && { discountType: dto.discountType }),
      ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
      ...(dto.minimumOrderAmount !== undefined && { minimumOrderAmount: dto.minimumOrderAmount }),
      ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.applicableCategories !== undefined && { applicableCategories: dto.applicableCategories }),
    });
    return this.repo.save(promo);
  }

  async deactivate(id: string): Promise<Promotion> {
    const promo = await this.findOne(id);
    promo.isActive = false;
    return this.repo.save(promo);
  }

  async remove(id: string): Promise<void> {
    const promo = await this.findOne(id);
    await this.repo.remove(promo);
  }

  async getStats(): Promise<{ total: number; active: number; expired: number; totalRedemptions: number; topPromotion: string | null }> {
    const all = await this.repo.find({ order: { usageCount: 'DESC' } });
    const now = new Date();
    const active = all.filter((p) => p.isActive && p.startsAt <= now && p.endsAt >= now).length;
    const expired = all.filter((p) => p.endsAt < now).length;
    const totalRedemptions = all.reduce((s, p) => s + (p.usageCount ?? 0), 0);
    const topPromotion = all.length > 0 ? all[0].name : null;
    return { total: all.length, active, expired, totalRedemptions, topPromotion };
  }

  async applyToOrder(promotionId: string, orderAmountCents: number): Promise<ApplyResult> {
    const promo = await this.findOne(promotionId);
    const now = new Date();

    if (!promo.isActive) return { valid: false, discountAmountCents: 0, message: 'Promotion is not active' };
    if (promo.startsAt > now) return { valid: false, discountAmountCents: 0, message: 'Promotion has not started yet' };
    if (promo.endsAt < now) return { valid: false, discountAmountCents: 0, message: 'Promotion has expired' };
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return { valid: false, discountAmountCents: 0, message: 'Usage limit reached' };
    }
    if (promo.minimumOrderAmount !== null && orderAmountCents < promo.minimumOrderAmount * 100) {
      return {
        valid: false,
        discountAmountCents: 0,
        message: `Minimum order of $${promo.minimumOrderAmount} required`,
      };
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = Math.round((orderAmountCents * Number(promo.discountValue)) / 100);
    } else {
      discount = Math.round(Number(promo.discountValue) * 100);
    }
    discount = Math.min(discount, orderAmountCents);

    await this.repo.increment({ id: promotionId }, 'usageCount', 1);

    return { valid: true, discountAmountCents: discount };
  }
}
