import { apiSlice } from '../api.slice';

export interface PriceAlertDto {
  id: string;
  userId: string;
  productId: string;
  targetPriceCents: number | null;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export interface AlertStatusDto {
  hasAlert: boolean;
  targetPriceCents: number | null;
}

export const priceAlertsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyAlerts: build.query<PriceAlertDto[], void>({
      query: () => '/price-alerts',
      providesTags: [{ type: 'User' as const, id: 'price-alerts' }],
    }),

    getAlertStatus: build.query<AlertStatusDto, string>({
      query: (productId) => `/price-alerts/product/${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'User' as const, id: `alert-${productId}` }],
    }),

    subscribePriceAlert: build.mutation<PriceAlertDto, { productId: string; targetPriceCents?: number }>({
      query: (body) => ({ url: '/price-alerts', method: 'POST', body }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'User' as const, id: 'price-alerts' },
        { type: 'User' as const, id: `alert-${productId}` },
      ],
    }),

    unsubscribePriceAlert: build.mutation<void, string>({
      query: (productId) => ({ url: `/price-alerts/product/${productId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, productId) => [
        { type: 'User' as const, id: 'price-alerts' },
        { type: 'User' as const, id: `alert-${productId}` },
      ],
    }),
  }),
});

export const {
  useGetMyAlertsQuery,
  useGetAlertStatusQuery,
  useSubscribePriceAlertMutation,
  useUnsubscribePriceAlertMutation,
} = priceAlertsApi;
