import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CartService } from '../cart.service';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { CatalogService } from '../../catalog/catalog.service';

const mockCartRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockItemRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCatalog = {
  findVariantById: jest.fn(),
};

const baseCart: Cart = {
  id: 'cart-1',
  userId: 'user-1',
  anonymousToken: null,
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Cart;

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockItemRepo },
        { provide: CatalogService, useValue: mockCatalog },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  describe('getOrCreate', () => {
    it('returns existing cart for known userId', async () => {
      mockCartRepo.findOne.mockResolvedValue(baseCart);
      const result = await service.getOrCreate('user-1');
      expect(result).toEqual(baseCart);
      expect(mockCartRepo.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });

    it('creates new cart when none exists for userId', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);
      mockCartRepo.create.mockReturnValue(baseCart);
      mockCartRepo.save.mockResolvedValue(baseCart);
      const result = await service.getOrCreate('new-user');
      expect(mockCartRepo.save).toHaveBeenCalled();
      expect(result).toEqual(baseCart);
    });

    it('returns existing anonymous cart by token', async () => {
      const anonCart = { ...baseCart, userId: undefined, anonymousToken: 'tok-abc' };
      mockCartRepo.findOne.mockResolvedValue(anonCart);
      const result = await service.getOrCreate(undefined, 'tok-abc');
      expect(result).toEqual(anonCart);
    });

    it('creates new anonymous cart when token not found', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);
      const newCart = { ...baseCart, anonymousToken: 'tok-xyz' };
      mockCartRepo.create.mockReturnValue(newCart);
      mockCartRepo.save.mockResolvedValue(newCart);
      const result = await service.getOrCreate(undefined, 'tok-xyz');
      expect(mockCartRepo.save).toHaveBeenCalled();
      expect(result).toEqual(newCart);
    });
  });

  describe('addItem', () => {
    it('creates new cart item when variant not in cart', async () => {
      const variant = { id: 'v1', priceCents: 5000, stockQty: 10 };
      mockCatalog.findVariantById.mockResolvedValue(variant);
      mockItemRepo.findOne.mockResolvedValue(null);
      mockItemRepo.create.mockReturnValue({ cartId: 'cart-1', variantId: 'v1', quantity: 1 });
      mockItemRepo.save.mockResolvedValue({});
      mockCartRepo.findOne.mockResolvedValue(baseCart);

      await service.addItem('cart-1', { variantId: 'v1', quantity: 1 });

      expect(mockItemRepo.save).toHaveBeenCalled();
    });

    it('increments quantity when variant already in cart', async () => {
      const variant = { id: 'v1', priceCents: 5000 };
      const existingItem = { id: 'item-1', cartId: 'cart-1', variantId: 'v1', quantity: 2 };
      mockCatalog.findVariantById.mockResolvedValue(variant);
      mockItemRepo.findOne.mockResolvedValue(existingItem);
      mockItemRepo.update.mockResolvedValue({});
      mockCartRepo.findOne.mockResolvedValue(baseCart);

      await service.addItem('cart-1', { variantId: 'v1', quantity: 3 });

      expect(mockItemRepo.update).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({ quantity: 5 }),
      );
    });
  });

  describe('updateItem', () => {
    it('deletes item when quantity is 0', async () => {
      const item = { id: 'item-1', cartId: 'cart-1', variantId: 'v1', quantity: 2 };
      mockItemRepo.findOne.mockResolvedValue(item);
      mockItemRepo.delete.mockResolvedValue({});
      mockCartRepo.findOne.mockResolvedValue(baseCart);

      await service.updateItem('cart-1', 'item-1', { quantity: 0 });

      expect(mockItemRepo.delete).toHaveBeenCalledWith('item-1');
    });

    it('updates quantity otherwise', async () => {
      const item = { id: 'item-1', cartId: 'cart-1', variantId: 'v1', quantity: 2 };
      mockItemRepo.findOne.mockResolvedValue(item);
      mockItemRepo.update.mockResolvedValue({});
      mockCartRepo.findOne.mockResolvedValue(baseCart);

      await service.updateItem('cart-1', 'item-1', { quantity: 5 });

      expect(mockItemRepo.update).toHaveBeenCalledWith('item-1', { quantity: 5 });
    });

    it('throws NotFoundException if item not found', async () => {
      mockItemRepo.findOne.mockResolvedValue(null);
      await expect(service.updateItem('cart-1', 'bad-item', { quantity: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('calls delete with cartId and itemId', async () => {
      mockItemRepo.delete.mockResolvedValue({});
      await service.removeItem('cart-1', 'item-1');
      expect(mockItemRepo.delete).toHaveBeenCalledWith({ id: 'item-1', cartId: 'cart-1' });
    });
  });

  describe('clearCart', () => {
    it('deletes all items for the cart', async () => {
      mockItemRepo.delete.mockResolvedValue({});
      await service.clearCart('cart-1');
      expect(mockItemRepo.delete).toHaveBeenCalledWith({ cartId: 'cart-1' });
    });
  });
});
