import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/coupon.dto';

export interface CouponValidationResult {
  valid: boolean;
  discountCents: number;
  couponId: string;
  message?: string;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepo.create({
      ...dto,
      code: dto.code.toUpperCase(),
      isActive: dto.isActive ?? true,
    });
    return this.couponRepo.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) throw new NotFoundException(`Coupon '${code}' not found`);
    return coupon;
  }

  async validate(code: string, orderTotalCents: number): Promise<CouponValidationResult> {
    let coupon: Coupon;
    try {
      coupon = await this.findByCode(code);
    } catch {
      return { valid: false, discountCents: 0, couponId: '', message: 'Invalid coupon code' };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, discountCents: 0, couponId: coupon.id, message: 'Coupon has expired' };
    }

    if (coupon.maxUsageCount !== null && coupon.usageCount >= coupon.maxUsageCount) {
      return { valid: false, discountCents: 0, couponId: coupon.id, message: 'Coupon usage limit reached' };
    }

    if (coupon.minOrderCents !== null && orderTotalCents < coupon.minOrderCents) {
      return {
        valid: false,
        discountCents: 0,
        couponId: coupon.id,
        message: `Minimum order of $${(coupon.minOrderCents / 100).toFixed(2)} required`,
      };
    }

    const discountCents =
      coupon.discountType === 'percentage'
        ? Math.floor((orderTotalCents * coupon.discountValue) / 100)
        : Math.min(coupon.discountValue, orderTotalCents);

    return { valid: true, discountCents, couponId: coupon.id };
  }

  async redeem(couponId: string): Promise<void> {
    await this.couponRepo.increment({ id: couponId }, 'usageCount', 1);
  }

  async deactivate(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.isActive = false;
    return this.couponRepo.save(coupon);
  }
}
