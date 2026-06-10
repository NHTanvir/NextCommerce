import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from '../cart.controller';
import { CartService } from '../cart.service';
import type { UserPayload } from '@nextcommerce/shared';

const user: UserPayload = { sub: 'user-1', email: 'user@test.com', role: 'user' };

const mockCart = { id: 'cart-1', items: [], totalCents: 0, anonymousToken: 'anon-token' };

const mockService: Partial<CartService> = {
  getOrCreate: jest.fn().mockResolvedValue(mockCart),
  addItem: jest.fn().mockResolvedValue({ ...mockCart, items: [{ id: 'item-1' }] }),
  updateItem: jest.fn().mockResolvedValue(mockCart),
  removeItem: jest.fn().mockResolvedValue(mockCart),
  mergeAnonymousCart: jest.fn().mockResolvedValue(mockCart),
};

describe('CartController', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockService }],
    }).compile();

    controller = module.get(CartController);
    jest.clearAllMocks();
  });

  it('getCart() calls getOrCreate with anonymous token', async () => {
    await controller.getCart(undefined, 'anon-123');
    expect(mockService.getOrCreate).toHaveBeenCalledWith(undefined, 'anon-123');
  });

  it('addItem() resolves cart then adds item', async () => {
    const dto = { variantId: 'v-1', quantity: 2 } as any;
    await controller.addItem(dto, 'anon-123');
    expect(mockService.getOrCreate).toHaveBeenCalledWith(undefined, 'anon-123');
    expect(mockService.addItem).toHaveBeenCalledWith('cart-1', dto);
  });

  it('updateItem() resolves cart then updates item', async () => {
    const dto = { quantity: 3 } as any;
    await controller.updateItem('item-1', dto, 'anon-123');
    expect(mockService.updateItem).toHaveBeenCalledWith('cart-1', 'item-1', dto);
  });

  it('removeItem() resolves cart then removes item', async () => {
    await controller.removeItem('item-1', 'anon-123');
    expect(mockService.removeItem).toHaveBeenCalledWith('cart-1', 'item-1');
  });

  it('mergeCart() calls mergeAnonymousCart when anonymousToken provided', async () => {
    await controller.mergeCart({ anonymousToken: 'anon-abc' }, user);
    expect(mockService.mergeAnonymousCart).toHaveBeenCalledWith('user-1', 'anon-abc');
  });

  it('mergeCart() calls getOrCreate for user when no anonymousToken', async () => {
    await controller.mergeCart({ anonymousToken: '' }, user);
    expect(mockService.getOrCreate).toHaveBeenCalledWith('user-1');
    expect(mockService.mergeAnonymousCart).not.toHaveBeenCalled();
  });
});
