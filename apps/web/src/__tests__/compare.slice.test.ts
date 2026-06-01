import compareReducer, {
  addToCompare,
  removeFromCompare,
  clearCompare,
  toggleCompareDrawer,
  selectCompareProducts,
  selectCompareCount,
  selectIsComparing,
  selectCompareDrawerOpen,
  CompareProduct,
} from '../store/slices/compare.slice';

const makeProduct = (n: number): CompareProduct => ({
  id: `p${n}`,
  slug: `product-${n}`,
  title: `Product ${n}`,
  brand: `Brand ${n}`,
  basePriceCents: n * 1000,
});

const emptyState = { products: [], isDrawerOpen: false };

describe('compare slice', () => {
  describe('addToCompare', () => {
    it('adds product and opens drawer', () => {
      const state = compareReducer(emptyState, addToCompare(makeProduct(1)));
      expect(state.products).toHaveLength(1);
      expect(state.isDrawerOpen).toBe(true);
    });

    it('does not add duplicate products', () => {
      const s1 = compareReducer(emptyState, addToCompare(makeProduct(1)));
      const s2 = compareReducer(s1, addToCompare(makeProduct(1)));
      expect(s2.products).toHaveLength(1);
    });

    it('enforces max 4 products', () => {
      let state = emptyState;
      for (let i = 1; i <= 5; i++) {
        state = compareReducer(state, addToCompare(makeProduct(i)));
      }
      expect(state.products).toHaveLength(4);
    });
  });

  describe('removeFromCompare', () => {
    it('removes a product by id', () => {
      const populated = { products: [makeProduct(1), makeProduct(2)], isDrawerOpen: true };
      const state = compareReducer(populated, removeFromCompare('p1'));
      expect(state.products).toHaveLength(1);
      expect(state.products[0].id).toBe('p2');
    });

    it('closes drawer when last product removed', () => {
      const single = { products: [makeProduct(1)], isDrawerOpen: true };
      const state = compareReducer(single, removeFromCompare('p1'));
      expect(state.isDrawerOpen).toBe(false);
      expect(state.products).toHaveLength(0);
    });
  });

  describe('clearCompare', () => {
    it('clears all products and closes drawer', () => {
      const populated = { products: [makeProduct(1), makeProduct(2)], isDrawerOpen: true };
      const state = compareReducer(populated, clearCompare());
      expect(state.products).toHaveLength(0);
      expect(state.isDrawerOpen).toBe(false);
    });
  });

  describe('toggleCompareDrawer', () => {
    it('toggles drawer state', () => {
      const s1 = compareReducer(emptyState, toggleCompareDrawer());
      expect(s1.isDrawerOpen).toBe(true);
      const s2 = compareReducer(s1, toggleCompareDrawer());
      expect(s2.isDrawerOpen).toBe(false);
    });
  });

  describe('selectors', () => {
    const mockRoot = {
      compare: { products: [makeProduct(1), makeProduct(2)], isDrawerOpen: true },
    } as any;

    it('selectCompareProducts returns products array', () => {
      expect(selectCompareProducts(mockRoot)).toHaveLength(2);
    });

    it('selectCompareCount returns product count', () => {
      expect(selectCompareCount(mockRoot)).toBe(2);
    });

    it('selectIsComparing returns true for comparing product', () => {
      expect(selectIsComparing('p1')(mockRoot)).toBe(true);
    });

    it('selectIsComparing returns false for non-comparing product', () => {
      expect(selectIsComparing('p99')(mockRoot)).toBe(false);
    });

    it('selectCompareDrawerOpen reflects drawer state', () => {
      expect(selectCompareDrawerOpen(mockRoot)).toBe(true);
    });
  });
});
