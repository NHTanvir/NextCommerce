import { apiSlice } from '../api.slice';

export interface ReferralCodeDto {
  id: string;
  userId: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReferralDto {
  id: string;
  referrerId: string;
  refereeId: string;
  status: 'pending' | 'completed' | 'paid';
  rewardPointsGranted: number | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ReferralStats {
  code: string | null;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

export interface ReferralOverview {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalCodes: number;
  totalPointsGranted: number;
  conversionRate: number;
}

export interface AdminReferralList {
  data: ReferralDto[];
  total: number;
  page: number;
  totalPages: number;
}

export const referralsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyReferralCode: build.query<ReferralCodeDto, void>({
      query: () => '/referrals/my-code',
      providesTags: [{ type: 'User' as const, id: 'referral-code' }],
    }),

    getReferralStats: build.query<ReferralStats, void>({
      query: () => '/referrals/stats',
      providesTags: [{ type: 'User' as const, id: 'referral-stats' }],
    }),

    getReferralHistory: build.query<ReferralDto[], void>({
      query: () => '/referrals/history',
      providesTags: [{ type: 'User' as const, id: 'referral-history' }],
    }),

    applyReferralCode: build.mutation<ReferralDto, string>({
      query: (code) => ({ url: '/referrals/apply', method: 'POST', body: { code } }),
      invalidatesTags: [{ type: 'User' as const, id: 'referral-stats' }],
    }),

    adminGetReferralOverview: build.query<ReferralOverview, void>({
      query: () => '/referrals/admin/overview',
    }),

    adminListReferrals: build.query<AdminReferralList, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `/referrals/admin/list?page=${page}&limit=${limit}`,
    }),
  }),
});

export const {
  useGetMyReferralCodeQuery,
  useGetReferralStatsQuery,
  useGetReferralHistoryQuery,
  useApplyReferralCodeMutation,
  useAdminGetReferralOverviewQuery,
  useAdminListReferralsQuery,
} = referralsApi;
