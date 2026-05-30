import { CatalogService } from './catalog.service';
import type { ProductDto } from '@nextcommerce/shared';

describe('CatalogService.toDto (static mapping)', () => {
  it('maps product entity fields to DTO shape', () => {
    const product = {
      id: 'p1',
      title: 'Test Shoe',
      slug: 'test-shoe',
      brand: 'TestBrand',
      description: 'A shoe',
      images: [{ url: 'http://img.com/shoe.jpg' }],
      category: { id: 'cat1', name: 'Running' },
      variants: [
        { id: 'v1', size: 10, color: 'Red', sku: 'TS-R-10', stockQty: 5, priceCents: 9999 },
      ],
    };

    const dto = CatalogService.toDto(product as any);

    expect(dto.id).toBe('p1');
    expect(dto.title).toBe('Test Shoe');
    expect(dto.slug).toBe('test-shoe');
    expect(dto.brand).toBe('TestBrand');
    expect(dto.images).toHaveLength(1);
    expect(dto.variants).toHaveLength(1);
    expect(dto.variants[0].priceCents).toBe(9999);
    expect(dto.category?.name).toBe('Running');
  });

  it('handles missing optional fields gracefully', () => {
    const product = {
      id: 'p2',
      title: 'Minimal Shoe',
      slug: 'minimal-shoe',
      brand: null,
      description: null,
      images: null,
      category: null,
      variants: [],
    };

    const dto = CatalogService.toDto(product as any);

    expect(dto.brand).toBeNull();
    expect(dto.images).toEqual([]);
    expect(dto.variants).toEqual([]);
    expect(dto.category).toBeNull();
  });
});
