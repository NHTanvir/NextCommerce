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

export interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: string;
  updatedAt: string;
}

export interface LoyaltyAccountsPage {
  data: LoyaltyAccount[];
  total: number;
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

    getLoyaltyTierBreakdown: build.query<Array<{ tier: string; count: number; totalPoints: number }>, void>({
      query: () => '/loyalty/admin/tier-breakdown',
      providesTags: [{ type: 'User' as const, id: 'LOYALTY_TIERS' }],
    }),

    getAdminLoyaltyAccounts: build.query<LoyaltyAccountsPage, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 30 } = {}) => `/loyalty/admin/accounts?page=${page}&limit=${limit}`,
      providesTags: ['Loyalty'],
    }),

    awardLoyaltyBonus: build.mutation<void, { userId: string; points: number; description: string }>({
      query: (body) => ({ url: '/loyalty/admin/award', method: 'POST', body }),
      invalidatesTags: ['Loyalty'],
    }),

    getLoyaltyAdminStats: build.query<{
      totalAccounts: number;
      totalPointsInCirculation: number;
      totalLifetimePoints: number;
      totalRedemptions: number;
      totalPointsRedeemed: number;
    }, void>({
      query: () => '/loyalty/admin/stats',
      providesTags: ['Loyalty'],
    }),
  }),
});

export const {
  useGetLoyaltyBalanceQuery,
  useGetLoyaltyHistoryQuery,
  useRedeemPointsMutation,
  useGetLoyaltyTierBreakdownQuery,
  useGetAdminLoyaltyAccountsQuery,
  useAwardLoyaltyBonusMutation,
  useGetLoyaltyAdminStatsQuery,
} = loyaltyApi;
