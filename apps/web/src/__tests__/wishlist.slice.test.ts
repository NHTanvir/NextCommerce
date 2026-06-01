import wishlistReducer, {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  toggleWishlist,
  selectWishlistItems,
  selectWishlistCount,
  selectIsWishlisted,
  WishlistItem,
} from '../store/slices/wishlist.slice';

const item1: WishlistItem = {
  productId: 'p1',
  slug: 'nike-air-max',
  title: 'Nike Air Max',
  brand: 'Nike',
  basePriceCents: 12000,
  addedAt: '2024-01-01T00:00:00Z',
};

const item2: WishlistItem = {
  productId: 'p2',
  slug: 'adidas-ultra-boost',
  title: 'Adidas Ultra Boost',
  brand: 'Adidas',
  basePriceCents: 15000,
  addedAt: '2024-01-02T00:00:00Z',
};

const emptyState = { items: [] };

describe('wishlist slice', () => {
  describe('addToWishlist', () => {
    it('adds an item to empty wishlist', () => {
      const state = wishlistReducer(emptyState, addToWishlist(item1));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(item1);
    });

    it('does not add duplicate items', () => {
      const state1 = wishlistReducer(emptyState, addToWishlist(item1));
      const state2 = wishlistReducer(state1, addToWishlist(item1));
      expect(state2.items).toHaveLength(1);
    });

    it('adds multiple distinct items', () => {
      const state1 = wishlistReducer(emptyState, addToWishlist(item1));
      const state2 = wishlistReducer(state1, addToWishlist(item2));
      expect(state2.items).toHaveLength(2);
    });
  });

  describe('removeFromWishlist', () => {
    it('removes item by productId', () => {
      const populated = { items: [item1, item2] };
      const state = wishlistReducer(populated, removeFromWishlist('p1'));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].productId).toBe('p2');
    });

    it('no-ops on unknown productId', () => {
      const populated = { items: [item1] };
      const state = wishlistReducer(populated, removeFromWishlist('unknown'));
      expect(state.items).toHaveLength(1);
    });
  });

  describe('clearWishlist', () => {
    it('empties all items', () => {
      const populated = { items: [item1, item2] };
      const state = wishlistReducer(populated, clearWishlist());
      expect(state.items).toHaveLength(0);
    });
  });

  describe('toggleWishlist', () => {
    it('adds item if not present', () => {
      const state = wishlistReducer(emptyState, toggleWishlist(item1));
      expect(state.items).toHaveLength(1);
    });

    it('removes item if already present', () => {
      const populated = { items: [item1] };
      const state = wishlistReducer(populated, toggleWishlist(item1));
      expect(state.items).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    const mockRoot = {
      wishlist: { items: [item1, item2] },
    } as any;

    it('selectWishlistItems returns all items', () => {
      expect(selectWishlistItems(mockRoot)).toEqual([item1, item2]);
    });

    it('selectWishlistCount returns correct count', () => {
      expect(selectWishlistCount(mockRoot)).toBe(2);
    });

    it('selectIsWishlisted returns true for wishlisted product', () => {
      expect(selectIsWishlisted('p1')(mockRoot)).toBe(true);
    });

    it('selectIsWishlisted returns false for non-wishlisted product', () => {
      expect(selectIsWishlisted('p99')(mockRoot)).toBe(false);
    });
  });
});
