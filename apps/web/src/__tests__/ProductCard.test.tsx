import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { renderWithStore } from '@/test/renderWithStore';
import type { ProductDto } from '@nextcommerce/shared';

function makeProduct(overrides: Partial<ProductDto> = {}): ProductDto {
  return {
    id: 'p1',
    slug: 'air-max-90',
    title: 'Air Max 90',
    description: 'Classic shoe',
    brand: 'Nike',
    basePriceCents: 11000,
    categoryId: 'c1',
    images: [],
    variants: [
      { id: 'v1', size: 10, color: 'White', sku: 'AM90-10', stockQty: 5, priceCents: 11000 },
    ],
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('ProductCard', () => {
  it('renders title, brand, and formatted price', () => {
    renderWithStore(<ProductCard product={makeProduct()} />);
    expect(screen.getByText('Air Max 90')).toBeInTheDocument();
    expect(screen.getByText('Nike')).toBeInTheDocument();
    expect(screen.getByText('$110.00')).toBeInTheDocument();
  });

  it('links to the product detail page using the slug', () => {
    renderWithStore(<ProductCard product={makeProduct()} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/air-max-90');
  });

  it('shows wishlist and compare quick-action buttons', () => {
    renderWithStore(<ProductCard product={makeProduct()} />);
    expect(screen.getByLabelText(/add to wishlist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/add to compare/i)).toBeInTheDocument();
  });

  it('shows a Low Stock badge when any variant is out of stock', () => {
    const product = makeProduct({
      variants: [
        { id: 'v1', size: 9, color: 'Black', sku: 'AM90-9-B', stockQty: 0, priceCents: 11000 },
        { id: 'v2', size: 10, color: 'White', sku: 'AM90-10-W', stockQty: 4, priceCents: 11000 },
      ],
    });
    renderWithStore(<ProductCard product={product} />);
    expect(screen.getByText(/Low Stock/i)).toBeInTheDocument();
  });

  it('uses the minimum variant price when variants are priced differently', () => {
    const product = makeProduct({
      basePriceCents: 18000,
      variants: [
        { id: 'v1', size: 9, color: 'Black', sku: 'X-9', stockQty: 4, priceCents: 18000 },
        { id: 'v2', size: 10, color: 'White', sku: 'X-10', stockQty: 4, priceCents: 9999 },
      ],
    });
    renderWithStore(<ProductCard product={product} />);
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
