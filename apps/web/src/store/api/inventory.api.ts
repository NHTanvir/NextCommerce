import { apiSlice } from '../api.slice';

export interface VariantStockSummary {
  variantId: string;
  sku: string;
  size: number;
  color: string;
  stockQty: number;
  priceCents: number;
  isLowStock: boolean;
}

export interface ProductInventory {
  productId: string;
  title: string;
  slug: string;
  variants: VariantStockSummary[];
  totalStock: number;
  lowStockCount: number;
}

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductInventory: builder.query<ProductInventory, string>({
      query: (productId) => `/inventory/products/${productId}`,
    }),
    getLowStockAlerts: builder.query<VariantStockSummary[], number | void>({
      query: (threshold) =>
        threshold !== undefined
          ? `/inventory/alerts?threshold=${threshold}`
          : '/inventory/alerts',
    }),
    adjustStock: builder.mutation<void, { variantId: string; delta: number }>({
      query: ({ variantId, delta }) => ({
        url: `/inventory/variants/${variantId}/adjust`,
        method: 'PATCH',
        body: { delta },
      }),
    }),
    setStock: builder.mutation<void, { variantId: string; quantity: number }>({
      query: ({ variantId, quantity }) => ({
        url: `/inventory/variants/${variantId}/stock`,
        method: 'PUT',
        body: { quantity },
      }),
    }),
  }),
});

export const {
  useGetProductInventoryQuery,
  useGetLowStockAlertsQuery,
  useAdjustStockMutation,
  useSetStockMutation,
} = inventoryApi;
