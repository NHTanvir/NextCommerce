import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftCard } from './entities/gift-card.entity';
import { randomBytes } from 'crypto';
import { IsInt, IsString, IsOptional, IsEmail, Min, MinLength, MaxLength } from 'class-validator';

export class CreateGiftCardDto {
  @IsInt() @Min(500) amountCents: number; // min $5
  @IsOptional() @IsEmail() recipientEmail?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100) recipientName?: string;
  @IsOptional() @IsString() @MaxLength(300) message?: string;
}

export class RedeemGiftCardDto {
  @IsString() @MinLength(10) code: string;
}

@Injectable()
export class GiftCardsService {
  constructor(
    @InjectRepository(GiftCard) private readonly cardRepo: Repository<GiftCard>,
  ) {}

  private generateCode(): string {
    const raw = randomBytes(8).toString('hex').toUpperCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
  }

  async purchase(userId: string, dto: CreateGiftCardDto): Promise<GiftCard> {
    const code = this.generateCode();
    const card = this.cardRepo.create({
      code,
      initialAmountCents: dto.amountCents,
      remainingAmountCents: dto.amountCents,
      purchasedByUserId: userId,
      recipientEmail: dto.recipientEmail ?? null,
      recipientName: dto.recipientName ?? null,
      message: dto.message ?? null,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });
    return this.cardRepo.save(card);
  }

  async findByCode(code: string): Promise<GiftCard | null> {
    return this.cardRepo.findOne({ where: { code: code.toUpperCase() } });
  }

  async getBalance(code: string): Promise<{ code: string; remaining: number; isValid: boolean; expiresAt: Date | null }> {
    const card = await this.findByCode(code);
    if (!card) return { code, remaining: 0, isValid: false, expiresAt: null };

    const expired = card.expiresAt ? new Date() > card.expiresAt : false;
    const isValid = card.isActive && !expired && card.remainingAmountCents > 0;

    return { code, remaining: card.remainingAmountCents, isValid, expiresAt: card.expiresAt };
  }

  async applyToOrder(code: string, userId: string, orderAmountCents: number): Promise<{ discountCents: number; remainingAfter: number }> {
    const card = await this.findByCode(code);
    if (!card) throw new NotFoundException('Gift card not found');
    if (!card.isActive) throw new BadRequestException('Gift card is no longer active');
    if (card.expiresAt && new Date() > card.expiresAt) throw new BadRequestException('Gift card has expired');
    if (card.remainingAmountCents <= 0) throw new BadRequestException('Gift card has no remaining balance');

    const discountCents = Math.min(card.remainingAmountCents, orderAmountCents);
    const remainingAfter = card.remainingAmountCents - discountCents;

    await this.cardRepo.update(card.id, {
      remainingAmountCents: remainingAfter,
      redeemedByUserId: userId,
      isActive: remainingAfter > 0,
    });

    return { discountCents, remainingAfter };
  }

  async deactivate(id: string): Promise<GiftCard> {
    const card = await this.cardRepo.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Gift card not found');
    await this.cardRepo.update(id, { isActive: false });
    return this.cardRepo.findOne({ where: { id } }) as Promise<GiftCard>;
  }

  async findAll(page = 1, limit = 20): Promise<{ data: GiftCard[]; total: number }> {
    const [data, total] = await this.cardRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findByUser(userId: string): Promise<GiftCard[]> {
    return this.cardRepo.find({
      where: { purchasedByUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
