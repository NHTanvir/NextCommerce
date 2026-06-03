import { apiSlice } from '../api.slice';

export interface LoyaltyBalance {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimePoints: number;
  nextTierPoints: number | null;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund';
  points: number;
  orderId: string | null;
  description: string;
  createdAt: string;
}

export interface RedeemResult {
  discountCents: number;
}

export const loyaltyApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getLoyaltyBalance: build.query<LoyaltyBalance, void>({
      query: () => '/loyalty/balance',
      providesTags: [{ type: 'User' as const, id: 'LOYALTY' }],
    }),

    getLoyaltyHistory: build.query<LoyaltyTransaction[], number | void>({
      query: (limit = 20) => `/loyalty/history?limit=${limit}`,
      providesTags: [{ type: 'User' as const, id: 'LOYALTY_HISTORY' }],
    }),

    redeemPoints: build.mutation<RedeemResult, number>({
      query: (points) => ({ url: '/loyalty/redeem', method: 'POST', body: { points } }),
      invalidatesTags: [
        { type: 'User' as const, id: 'LOYALTY' },
        { type: 'User' as const, id: 'LOYALTY_HISTORY' },
      ],
    }),
  }),
});

export const {
  useGetLoyaltyBalanceQuery,
  useGetLoyaltyHistoryQuery,
  useRedeemPointsMutation,
} = loyaltyApi;
