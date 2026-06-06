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

  async getTagsWithCounts(): Promise<Array<{ name: string; productCount: number }>> {
    const rows = await this.tagRepo
      .createQueryBuilder('t')
      .select('t.name', 'name')
      .addSelect('COUNT(t.productId)', 'productCount')
      .groupBy('t.name')
      .orderBy('productCount', 'DESC')
      .getRawMany<{ name: string; productCount: string }>();
    return rows.map((r) => ({ name: r.name, productCount: Number(r.productCount) }));
  }

  async getProductsForTag(tag: string): Promise<Array<{ productId: string }>> {
    const rows = await this.tagRepo.find({ where: { name: tag } });
    return rows.map((r) => ({ productId: r.productId }));
  }

  async removeAllTagsForName(name: string): Promise<{ deleted: number }> {
    const result = await this.tagRepo.delete({ name });
    return { deleted: result.affected ?? 0 };
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
