import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly repo: Repository<WishlistItem>,
  ) {}

  async findByUser(userId: string): Promise<WishlistItem[]> {
    return this.repo.find({
      where: { userId },
      order: { addedAt: 'DESC' },
    });
  }

  async add(userId: string, productId: string): Promise<WishlistItem> {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    if (existing) throw new ConflictException('Product already in wishlist');
    const item = this.repo.create({ userId, productId });
    return this.repo.save(item);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const item = await this.repo.findOne({ where: { userId, productId } });
    if (!item) throw new NotFoundException('Product not in wishlist');
    await this.repo.remove(item);
  }

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, productId } });
    return count > 0;
  }

  async toggle(userId: string, productId: string): Promise<{ wishlisted: boolean }> {
    const existing = await this.repo.findOne({ where: { userId, productId } });
    if (existing) {
      await this.repo.remove(existing);
      return { wishlisted: false };
    }
    await this.repo.save(this.repo.create({ userId, productId }));
    return { wishlisted: true };
  }
}
