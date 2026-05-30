import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CatalogService } from '../catalog/catalog.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    private readonly catalogService: CatalogService,
  ) {}

  async getOrCreate(userId?: string, token?: string): Promise<Cart> {
    if (userId) {
      const existing = await this.cartRepo.findOne({ where: { userId } });
      if (existing) return existing;
      return this.cartRepo.save(this.cartRepo.create({ userId }));
    }
    if (token) {
      const existing = await this.cartRepo.findOne({ where: { anonymousToken: token } });
      if (existing) return existing;
    }
    const newToken = token || uuidv4();
    return this.cartRepo.save(this.cartRepo.create({ anonymousToken: newToken }));
  }

  async addItem(cartId: string, dto: AddCartItemDto): Promise<Cart> {
    await this.catalogService.findVariantById(dto.variantId);

    const existing = await this.itemRepo.findOne({
      where: { cartId, variantId: dto.variantId },
    });

    if (existing) {
      await this.itemRepo.update(existing.id, {
        quantity: existing.quantity + dto.quantity,
      });
    } else {
      await this.itemRepo.save(
        this.itemRepo.create({ cartId, variantId: dto.variantId, quantity: dto.quantity }),
      );
    }

    return this.cartRepo.findOne({ where: { id: cartId } }) as Promise<Cart>;
  }

  async updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const item = await this.itemRepo.findOne({ where: { id: itemId, cartId } });
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity === 0) {
      await this.itemRepo.delete(itemId);
    } else {
      await this.itemRepo.update(itemId, { quantity: dto.quantity });
    }

    return this.cartRepo.findOne({ where: { id: cartId } }) as Promise<Cart>;
  }

  async removeItem(cartId: string, itemId: string): Promise<void> {
    await this.itemRepo.delete({ id: itemId, cartId });
  }

  async mergeAnonymousCart(userId: string, anonymousToken: string): Promise<Cart> {
    const anonCart = await this.cartRepo.findOne({ where: { anonymousToken } });
    if (!anonCart) return this.getOrCreate(userId);

    let userCart = await this.cartRepo.findOne({ where: { userId } });
    if (!userCart) {
      await this.cartRepo.update(anonCart.id, { userId, anonymousToken: null });
      return this.cartRepo.findOne({ where: { userId } }) as Promise<Cart>;
    }

    for (const item of anonCart.items) {
      const existing = await this.itemRepo.findOne({
        where: { cartId: userCart.id, variantId: item.variantId },
      });
      if (existing) {
        await this.itemRepo.update(existing.id, { quantity: existing.quantity + item.quantity });
      } else {
        await this.itemRepo.save(
          this.itemRepo.create({ cartId: userCart.id, variantId: item.variantId, quantity: item.quantity }),
        );
      }
    }

    await this.cartRepo.delete(anonCart.id);
    return this.cartRepo.findOne({ where: { userId } }) as Promise<Cart>;
  }

  async clearCart(cartId: string): Promise<void> {
    await this.itemRepo.delete({ cartId });
  }
}
