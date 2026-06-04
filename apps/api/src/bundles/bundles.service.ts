import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ProductBundle } from './entities/bundle.entity';

export class CreateBundleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];

  @IsInt()
  @Min(1)
  @Max(99)
  discountPercent: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discountAmountCents?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateBundleDto extends CreateBundleDto {}

@Injectable()
export class BundlesService {
  constructor(
    @InjectRepository(ProductBundle)
    private readonly repo: Repository<ProductBundle>,
  ) {}

  async create(dto: CreateBundleDto): Promise<ProductBundle> {
    if (dto.productIds.length < 2) {
      throw new BadRequestException('A bundle must contain at least 2 products.');
    }

    const bundle = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      productIds: [...new Set(dto.productIds)],
      discountPercent: dto.discountPercent,
      discountAmountCents: dto.discountAmountCents ?? null,
      isActive: true,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    return this.repo.save(bundle);
  }

  async findAll(includeInactive = false): Promise<ProductBundle[]> {
    const query = includeInactive ? {} : { isActive: true };
    return this.repo.find({ where: query, order: { createdAt: 'DESC' } });
  }

  async findActive(): Promise<ProductBundle[]> {
    const now = new Date();
    const all = await this.repo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });

    return all.filter((b) => {
      if (b.startsAt && b.startsAt > now) return false;
      if (b.endsAt && b.endsAt < now) return false;
      return true;
    });
  }

  async findOne(id: string): Promise<ProductBundle> {
    const bundle = await this.repo.findOne({ where: { id } });
    if (!bundle) throw new NotFoundException('Bundle not found.');
    return bundle;
  }

  async findBundlesForProduct(productId: string): Promise<ProductBundle[]> {
    const active = await this.findActive();
    return active.filter((b) => b.productIds.includes(productId));
  }

  async update(id: string, dto: Partial<CreateBundleDto>): Promise<ProductBundle> {
    const bundle = await this.findOne(id);

    if (dto.productIds && dto.productIds.length < 2) {
      throw new BadRequestException('A bundle must contain at least 2 products.');
    }

    const updates: Partial<ProductBundle> = {};
    if (dto.name) updates.name = dto.name;
    if (dto.description !== undefined) updates.description = dto.description ?? null;
    if (dto.productIds) updates.productIds = [...new Set(dto.productIds)];
    if (dto.discountPercent !== undefined) updates.discountPercent = dto.discountPercent;
    if (dto.discountAmountCents !== undefined) updates.discountAmountCents = dto.discountAmountCents ?? null;
    if (dto.startsAt !== undefined) updates.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.endsAt !== undefined) updates.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;

    await this.repo.update(id, updates);
    return this.findOne(id);
  }

  async deactivate(id: string): Promise<ProductBundle> {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const bundle = await this.findOne(id);
    await this.repo.remove(bundle);
  }

  calculateBundlePrice(totalCents: number, discountPercent: number): number {
    return Math.round(totalCents * (1 - discountPercent / 100));
  }
}
