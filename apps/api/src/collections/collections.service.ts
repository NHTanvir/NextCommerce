import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString() @MinLength(2) @MaxLength(100) name: string;
  @IsString() @MinLength(2) @MaxLength(100) slug: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() bannerImageUrl?: string;
  @IsOptional() productIds?: string[];
  @IsOptional() @IsInt() @Min(0) @Max(80) discountPercent?: number;
  @IsOptional() startsAt?: string;
  @IsOptional() endsAt?: string;
}

export class UpdateCollectionDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() bannerImageUrl?: string;
  @IsOptional() productIds?: string[];
  @IsOptional() @IsInt() @Min(0) @Max(80) discountPercent?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
  ) {}

  async create(dto: CreateCollectionDto): Promise<Collection> {
    const existing = await this.collectionRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Collection with slug '${dto.slug}' already exists`);

    const collection = this.collectionRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      bannerImageUrl: dto.bannerImageUrl ?? null,
      productIds: dto.productIds ?? [],
      discountPercent: dto.discountPercent ?? 0,
      isActive: true,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    return this.collectionRepo.save(collection);
  }

  async findAll(includeInactive = false): Promise<Collection[]> {
    if (!includeInactive) {
      return this.collectionRepo.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
    }
    return this.collectionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findActive(): Promise<Collection[]> {
    const now = new Date();
    const all = await this.collectionRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
    return all.filter((c) => {
      if (c.startsAt && c.startsAt > now) return false;
      if (c.endsAt && c.endsAt < now) return false;
      return true;
    });
  }

  async findBySlug(slug: string): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({ where: { slug } });
    if (!collection) throw new NotFoundException(`Collection '${slug}' not found`);
    return collection;
  }

  async findById(id: string): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({ where: { id } });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async update(id: string, dto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.findById(id);
    const updates: Partial<Collection> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.bannerImageUrl !== undefined) updates.bannerImageUrl = dto.bannerImageUrl;
    if (dto.productIds !== undefined) updates.productIds = dto.productIds;
    if (dto.discountPercent !== undefined) updates.discountPercent = dto.discountPercent;
    if (dto.isActive !== undefined) updates.isActive = dto.isActive;

    await this.collectionRepo.update(id, updates);
    return this.findById(id);
  }

  async addProduct(id: string, productId: string): Promise<Collection> {
    const collection = await this.findById(id);
    if (!collection.productIds.includes(productId)) {
      collection.productIds = [...collection.productIds, productId];
      await this.collectionRepo.save(collection);
    }
    return collection;
  }

  async removeProduct(id: string, productId: string): Promise<Collection> {
    const collection = await this.findById(id);
    collection.productIds = collection.productIds.filter((pid) => pid !== productId);
    return this.collectionRepo.save(collection);
  }

  async remove(id: string): Promise<void> {
    const collection = await this.findById(id);
    await this.collectionRepo.remove(collection);
  }
}
