import { apiSlice } from '../api.slice';

export interface BackInStockSubDto {
  id: string;
  userId: string;
  variantId: string;
  productId: string;
  notified: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

export interface AdminStockAlertsPage {
  data: BackInStockSubDto[];
  total: number;
  pendingCount: number;
}

export const backInStockApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getBackInStockSubs: build.query<BackInStockSubDto[], void>({
      query: () => '/back-in-stock',
      providesTags: [{ type: 'User' as const, id: 'bis-subs' }],
    }),

    getVariantSubscriptionStatus: build.query<{ subscribed: boolean }, string>({
      query: (variantId) => `/back-in-stock/variant/${variantId}/status`,
      providesTags: (_r, _e, variantId) => [{ type: 'User' as const, id: `bis-${variantId}` }],
    }),

    subscribeBackInStock: build.mutation<BackInStockSubDto, { variantId: string; productId: string }>({
      query: (body) => ({ url: '/back-in-stock', method: 'POST', body }),
      invalidatesTags: (_r, _e, { variantId }) => [
        { type: 'User' as const, id: 'bis-subs' },
        { type: 'User' as const, id: `bis-${variantId}` },
      ],
    }),

    unsubscribeBackInStock: build.mutation<void, string>({
      query: (variantId) => ({ url: `/back-in-stock/variant/${variantId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, variantId) => [
        { type: 'User' as const, id: 'bis-subs' },
        { type: 'User' as const, id: `bis-${variantId}` },
      ],
    }),

    getAdminStockAlerts: build.query<AdminStockAlertsPage, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 30 } = {}) =>
        `/back-in-stock/admin/all?page=${page}&limit=${limit}`,
      providesTags: ['StockAlert'],
    }),
  }),
});

export const {
  useGetBackInStockSubsQuery,
  useGetVariantSubscriptionStatusQuery,
  useSubscribeBackInStockMutation,
  useUnsubscribeBackInStockMutation,
  useGetAdminStockAlertsQuery,
} = backInStockApi;
