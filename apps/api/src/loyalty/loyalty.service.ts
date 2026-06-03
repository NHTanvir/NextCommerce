import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyAccount } from './entities/loyalty-account.entity';
import { LoyaltyTransaction, LoyaltyTxType } from './entities/loyalty-transaction.entity';

export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 5000,
};

export const POINTS_PER_DOLLAR = 10;
export const POINTS_REDEEM_RATE = 100; // 100 points = $1

function computeTier(lifetimePoints: number): string {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold';
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyAccount) private readonly accountRepo: Repository<LoyaltyAccount>,
    @InjectRepository(LoyaltyTransaction) private readonly txRepo: Repository<LoyaltyTransaction>,
  ) {}

  async getOrCreateAccount(userId: string): Promise<LoyaltyAccount> {
    let account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) {
      account = await this.accountRepo.save(
        this.accountRepo.create({ userId, points: 0, lifetimePoints: 0, tier: 'bronze' }),
      );
    }
    return account;
  }

  async getBalance(userId: string): Promise<{ points: number; tier: string; lifetimePoints: number; nextTierPoints: number | null }> {
    const account = await this.getOrCreateAccount(userId);
    const tiers = Object.entries(TIER_THRESHOLDS).sort(([, a], [, b]) => b - a);
    const currentIdx = tiers.findIndex(([tier]) => tier === account.tier);
    const nextTier = tiers[currentIdx - 1];
    const nextTierPoints = nextTier ? nextTier[1] - account.lifetimePoints : null;

    return {
      points: account.points,
      tier: account.tier,
      lifetimePoints: account.lifetimePoints,
      nextTierPoints: nextTierPoints && nextTierPoints > 0 ? nextTierPoints : null,
    };
  }

  async earnPoints(userId: string, orderAmountCents: number, orderId: string): Promise<LoyaltyTransaction> {
    const points = Math.floor((orderAmountCents / 100) * POINTS_PER_DOLLAR);
    if (points <= 0) throw new BadRequestException('Order amount too small to earn points');
    return this.addTransaction(userId, 'earn', points, orderId, `Earned ${points} points for order`);
  }

  async redeemPoints(userId: string, pointsToRedeem: number): Promise<{ discountCents: number }> {
    if (pointsToRedeem <= 0) throw new BadRequestException('Points must be positive');
    const account = await this.getOrCreateAccount(userId);
    if (account.points < pointsToRedeem) {
      throw new BadRequestException(`Insufficient points: have ${account.points}, need ${pointsToRedeem}`);
    }
    await this.addTransaction(userId, 'redeem', -pointsToRedeem, null, `Redeemed ${pointsToRedeem} points`);
    const discountCents = Math.floor(pointsToRedeem / POINTS_REDEEM_RATE) * 100;
    return { discountCents };
  }

  async awardBonus(userId: string, points: number, description: string): Promise<LoyaltyTransaction> {
    if (points <= 0) throw new BadRequestException('Bonus points must be positive');
    return this.addTransaction(userId, 'bonus', points, null, description);
  }

  async getTransactionHistory(userId: string, limit = 20): Promise<LoyaltyTransaction[]> {
    return this.txRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async addTransaction(
    userId: string,
    type: LoyaltyTxType,
    points: number,
    orderId: string | null,
    description: string,
  ): Promise<LoyaltyTransaction> {
    const account = await this.getOrCreateAccount(userId);

    const newPoints = account.points + points;
    if (newPoints < 0) throw new BadRequestException('Insufficient points');

    const newLifetime = type === 'earn' || type === 'bonus'
      ? account.lifetimePoints + points
      : account.lifetimePoints;

    const newTier = computeTier(newLifetime);

    await this.accountRepo.update(account.id, {
      points: newPoints,
      lifetimePoints: newLifetime,
      tier: newTier,
    });

    const tx = await this.txRepo.save(
      this.txRepo.create({ userId, type, points, orderId, description }),
    );

    return tx;
  }
}
