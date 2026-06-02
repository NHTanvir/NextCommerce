import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductTag } from '../catalog/entities/product-tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(ProductTag)
    private readonly tagRepo: Repository<ProductTag>,
  ) {}

  async findAll(): Promise<string[]> {
    const tags = await this.tagRepo
      .createQueryBuilder('t')
      .select('DISTINCT t.name', 'name')
      .orderBy('t.name', 'ASC')
      .getRawMany<{ name: string }>();
    return tags.map((t) => t.name);
  }

  async findProductsByTag(tag: string): Promise<string[]> {
    const rows = await this.tagRepo.find({ where: { name: tag } });
    return rows.map((r) => r.productId);
  }

  async addTag(productId: string, name: string): Promise<void> {
    const existing = await this.tagRepo.findOne({ where: { productId, name } });
    if (!existing) {
      await this.tagRepo.save(this.tagRepo.create({ productId, name }));
    }
  }

  async removeTag(productId: string, name: string): Promise<void> {
    await this.tagRepo.delete({ productId, name });
  }
}
