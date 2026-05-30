import { cartReducer, addItem, updateQuantity, removeItem, clearCart, selectCartItemCount, selectCartTotal } from '../store/slices/cart.slice';
import type { CartItem } from '../store/slices/cart.slice';

const SHOE_A: CartItem = {
  variantId: 'v1',
  productId: 'p1',
  title: 'Air Max 90',
  slug: 'air-max-90',
  size: 10,
  color: 'White',
  priceCents: 11000,
  quantity: 1,
  imageUrl: '',
};

const SHOE_B: CartItem = {
  variantId: 'v2',
  productId: 'p2',
  title: 'Ultra Boost 5',
  slug: 'ultra-boost-5',
  size: 11,
  color: 'Black',
  priceCents: 18000,
  quantity: 2,
  imageUrl: '',
};

describe('cart slice', () => {
  it('starts with empty items', () => {
    const state = cartReducer(undefined, { type: '@@INIT' });
    expect(state.items).toHaveLength(0);
    expect(state.isOpen).toBe(false);
  });

  it('adds a new item', () => {
    const state = cartReducer(undefined, addItem(SHOE_A));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].variantId).toBe('v1');
    expect(state.items[0].quantity).toBe(1);
  });

  it('merges quantity for duplicate variantId', () => {
    let state = cartReducer(undefined, addItem(SHOE_A));
    state = cartReducer(state, addItem({ ...SHOE_A, quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('updates quantity', () => {
    let state = cartReducer(undefined, addItem(SHOE_A));
    state = cartReducer(state, updateQuantity({ variantId: 'v1', quantity: 5 }));
    expect(state.items[0].quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    let state = cartReducer(undefined, addItem(SHOE_A));
    state = cartReducer(state, updateQuantity({ variantId: 'v1', quantity: 0 }));
    expect(state.items).toHaveLength(0);
  });

  it('removes item by variantId', () => {
    let state = cartReducer(undefined, addItem(SHOE_A));
    state = cartReducer(state, addItem(SHOE_B));
    state = cartReducer(state, removeItem('v1'));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].variantId).toBe('v2');
  });

  it('clears all items', () => {
    let state = cartReducer(undefined, addItem(SHOE_A));
    state = cartReducer(state, addItem(SHOE_B));
    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
  });

  it('selectCartItemCount sums all quantities', () => {
    const state = {
      cart: cartReducer(cartReducer(undefined, addItem(SHOE_A)), addItem(SHOE_B)),
    } as any;
    expect(selectCartItemCount(state)).toBe(3); // 1 + 2
  });

  it('selectCartTotal sums price * quantity', () => {
    const state = {
      cart: cartReducer(cartReducer(undefined, addItem(SHOE_A)), addItem(SHOE_B)),
    } as any;
    // 11000*1 + 18000*2 = 11000 + 36000 = 47000
    expect(selectCartTotal(state)).toBe(47000);
  });
});
