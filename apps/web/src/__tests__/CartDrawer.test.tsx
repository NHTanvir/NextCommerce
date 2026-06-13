import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { renderWithStore } from '@/test/renderWithStore';
import type { CartItem } from '@/store/slices/cart.slice';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: 'v1',
    productId: 'p1',
    title: 'Air Max 90',
    slug: 'air-max-90',
    size: 10,
    color: 'White',
    priceCents: 11000,
    quantity: 1,
    imageUrl: '',
    ...overrides,
  };
}

const cartState = (overrides: { items?: CartItem[]; isOpen?: boolean } = {}) => ({
  cart: {
    items: overrides.items ?? [],
    isOpen: overrides.isOpen ?? false,
    anonymousToken: null,
  },
});

describe('CartDrawer', () => {
  it('renders nothing when the drawer is closed', () => {
    renderWithStore(<CartDrawer />, cartState({ isOpen: false }) as any);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the empty state with a "Start Shopping" link', () => {
    renderWithStore(<CartDrawer />, cartState({ isOpen: true }) as any);
    expect(screen.getByRole('dialog', { name: /shopping cart/i })).toBeInTheDocument();
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start shopping/i })).toHaveAttribute('href', '/products');
  });

  it('renders a line item, its size/color, and the line total', () => {
    renderWithStore(
      <CartDrawer />,
      cartState({
        isOpen: true,
        items: [makeItem({ quantity: 2, priceCents: 12500 })],
      }) as any,
    );
    expect(screen.getByText('Air Max 90')).toBeInTheDocument();
    expect(screen.getByText(/Size 10 · White/)).toBeInTheDocument();
    expect(screen.getAllByText('$250.00')[0]).toBeInTheDocument();
  });

  it('exposes a Checkout link pointing to /checkout when items exist', () => {
    renderWithStore(
      <CartDrawer />,
      cartState({ isOpen: true, items: [makeItem()] }) as any,
    );
    const link = screen.getByRole('link', { name: /checkout/i });
    expect(link).toHaveAttribute('href', '/checkout');
  });

  it('exposes quantity controls and a remove button per item', () => {
    renderWithStore(
      <CartDrawer />,
      cartState({ isOpen: true, items: [makeItem()] }) as any,
    );
    expect(screen.getByLabelText(/decrease quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/increase quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remove item/i)).toBeInTheDocument();
  });
});
