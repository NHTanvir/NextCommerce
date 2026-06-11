import reducer, {
  trackView,
  clearHistory,
} from '../store/slices/recentlyViewed.slice';

function product(id: string, overrides: Partial<{ slug: string; title: string }> = {}) {
  return {
    id,
    slug: overrides.slug ?? `product-${id}`,
    title: overrides.title ?? `Product ${id}`,
    brand: 'Nike',
    basePriceCents: 9999,
  };
}

describe('recentlyViewed slice', () => {
  it('trackView prepends the new product', () => {
    const next = reducer({ items: [] }, trackView(product('1')));
    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe('1');
    expect(typeof next.items[0].viewedAt).toBe('number');
  });
});
