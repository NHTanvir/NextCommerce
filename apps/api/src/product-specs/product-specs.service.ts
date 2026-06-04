import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ProductSpec } from './entities/product-spec.entity';

export class CreateSpecDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  value: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  group?: string;
}

export interface GroupedSpecs {
  [group: string]: Array<{ key: string; value: string; id: string }>;
}

@Injectable()
export class ProductSpecsService {
  constructor(
    @InjectRepository(ProductSpec)
    private readonly repo: Repository<ProductSpec>,
  ) {}

  async setSpec(productId: string, dto: CreateSpecDto): Promise<ProductSpec> {
    const existing = await this.repo.findOne({ where: { productId, key: dto.key } });

    if (existing) {
      await this.repo.update(existing.id, {
        value: dto.value,
        sortOrder: dto.sortOrder ?? existing.sortOrder,
        group: dto.group ?? existing.group,
      });
      return this.repo.findOne({ where: { id: existing.id } }) as Promise<ProductSpec>;
    }

    const spec = this.repo.create({
      productId,
      key: dto.key,
      value: dto.value,
      sortOrder: dto.sortOrder ?? 0,
      group: dto.group ?? null,
    });

    return this.repo.save(spec);
  }

  async bulkSet(productId: string, specs: CreateSpecDto[]): Promise<ProductSpec[]> {
    const results: ProductSpec[] = [];
    for (const spec of specs) {
      results.push(await this.setSpec(productId, spec));
    }
    return results;
  }

  async findForProduct(productId: string): Promise<ProductSpec[]> {
    return this.repo.find({
      where: { productId },
      order: { sortOrder: 'ASC', key: 'ASC' },
    });
  }

  async findGrouped(productId: string): Promise<GroupedSpecs> {
    const specs = await this.findForProduct(productId);

    return specs.reduce<GroupedSpecs>((acc, spec) => {
      const group = spec.group ?? 'General';
      if (!acc[group]) acc[group] = [];
      acc[group].push({ id: spec.id, key: spec.key, value: spec.value });
      return acc;
    }, {});
  }

  async deleteSpec(id: string, productId: string): Promise<void> {
    const spec = await this.repo.findOne({ where: { id, productId } });
    if (!spec) throw new NotFoundException('Spec not found.');
    await this.repo.remove(spec);
  }

  async deleteAllForProduct(productId: string): Promise<void> {
    await this.repo.delete({ productId });
  }
}
