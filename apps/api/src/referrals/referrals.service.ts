import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Referral } from './entities/referral.entity';
import { ReferralCode } from './entities/referral-code.entity';

const REFERRAL_REWARD_POINTS = 500;
const REFEREE_REWARD_POINTS = 250;

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral)
    private readonly referralRepo: Repository<Referral>,
    @InjectRepository(ReferralCode)
    private readonly codeRepo: Repository<ReferralCode>,
  ) {}

  async getOrCreateCode(userId: string): Promise<ReferralCode> {
    const existing = await this.codeRepo.findOne({ where: { userId, isActive: true } });
    if (existing) return existing;

    const code = this.generateCode(userId);
    const referralCode = this.codeRepo.create({ userId, code, isActive: true });
    return this.codeRepo.save(referralCode);
  }

  async applyReferralCode(refereeId: string, code: string): Promise<Referral> {
    const alreadyReferred = await this.referralRepo.findOne({ where: { refereeId } });
    if (alreadyReferred) {
      throw new ConflictException('You have already used a referral code.');
    }

    const referralCode = await this.codeRepo.findOne({ where: { code: code.toUpperCase(), isActive: true } });
    if (!referralCode) {
      throw new NotFoundException('Referral code not found or inactive.');
    }

    if (referralCode.userId === refereeId) {
      throw new BadRequestException('You cannot use your own referral code.');
    }

    const referral = this.referralRepo.create({
      referrerId: referralCode.userId,
      refereeId,
      status: 'pending',
      rewardPointsGranted: null,
      completedAt: null,
    });

    return this.referralRepo.save(referral);
  }

  async completeReferral(refereeId: string): Promise<Referral | null> {
    const referral = await this.referralRepo.findOne({
      where: { refereeId, status: 'pending' },
    });

    if (!referral) return null;

    await this.referralRepo.update(referral.id, {
      status: 'completed',
      rewardPointsGranted: REFERRAL_REWARD_POINTS,
      completedAt: new Date(),
    });

    return this.referralRepo.findOne({ where: { id: referral.id } });
  }

  async getReferralStats(userId: string): Promise<{
    code: string | null;
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalPointsEarned: number;
  }> {
    const codeEntity = await this.codeRepo.findOne({ where: { userId, isActive: true } });

    const referrals = await this.referralRepo.find({ where: { referrerId: userId } });

    const completed = referrals.filter((r) => r.status === 'completed');
    const totalPoints = completed.reduce((sum, r) => sum + (r.rewardPointsGranted ?? 0), 0);

    return {
      code: codeEntity?.code ?? null,
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      pendingReferrals: referrals.filter((r) => r.status === 'pending').length,
      totalPointsEarned: totalPoints,
    };
  }

  async getReferralHistory(userId: string): Promise<Referral[]> {
    return this.referralRepo.find({
      where: { referrerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  getRefereeRewardPoints(): number {
    return REFEREE_REWARD_POINTS;
  }

  getReferrerRewardPoints(): number {
    return REFERRAL_REWARD_POINTS;
  }

  async getAdminOverview() {
    const [totalReferrals, completedReferrals, totalCodes] = await Promise.all([
      this.referralRepo.count(),
      this.referralRepo.count({ where: { status: 'completed' } }),
      this.codeRepo.count(),
    ]);

    const pointsResult = await this.referralRepo
      .createQueryBuilder('r')
      .select('SUM(r.rewardPointsGranted)', 'total')
      .where('r.status = :s', { s: 'completed' })
      .getRawOne<{ total: string | null }>();

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals: totalReferrals - completedReferrals,
      totalCodes,
      totalPointsGranted: Number(pointsResult?.total ?? 0),
      conversionRate: totalReferrals ? Math.round((completedReferrals / totalReferrals) * 100) : 0,
    };
  }

  async adminListReferrals(page: number, limit: number) {
    const [data, total] = await this.referralRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  private generateCode(userId: string): string {
    const suffix = randomBytes(3).toString('hex').toUpperCase();
    const prefix = userId.slice(0, 4).toUpperCase();
    return `${prefix}${suffix}`;
  }
}
