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

  it('trackView deduplicates by id and moves item to the front', () => {
    let state = reducer({ items: [] }, trackView(product('1')));
    state = reducer(state, trackView(product('2')));
    state = reducer(state, trackView(product('1')));

    expect(state.items).toHaveLength(2);
    expect(state.items[0].id).toBe('1');
    expect(state.items[1].id).toBe('2');
  });

  it('caps history at 12 items', () => {
    let state: ReturnType<typeof reducer> = { items: [] };
    for (let i = 0; i < 20; i++) {
      state = reducer(state, trackView(product(String(i))));
    }
    expect(state.items).toHaveLength(12);
    // Most recently viewed is at the front
    expect(state.items[0].id).toBe('19');
    expect(state.items[11].id).toBe('8');
  });

  it('clearHistory empties the list', () => {
    const seeded = reducer({ items: [] }, trackView(product('1')));
    const cleared = reducer(seeded, clearHistory());
    expect(cleared.items).toEqual([]);
  });
});
