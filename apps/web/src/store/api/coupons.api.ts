import { apiSlice } from '../api.slice';

export interface CouponValidationResult {
  valid: boolean;
  discountCents: number;
  couponId: string;
  message?: string;
}

export interface CouponDto {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderCents: number | null;
  maxUsageCount: number | null;
  usageCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CouponStats {
  total: number;
  active: number;
  expired: number;
  totalRedemptions: number;
  topCoupons: { code: string; usageCount: number }[];
}

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation<CouponValidationResult, { code: string; orderTotalCents: number }>({
      query: (body) => ({
        url: '/coupons/validate',
        method: 'POST',
        body,
      }),
    }),

    getAdminCoupons: builder.query<CouponDto[], void>({
      query: () => '/coupons',
      providesTags: ['Coupon'],
    }),

    getAdminCouponStats: builder.query<CouponStats, void>({
      query: () => '/coupons/admin/stats',
      providesTags: ['Coupon'],
    }),

    createCoupon: builder.mutation<CouponDto, Partial<CouponDto>>({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),

    deactivateCoupon: builder.mutation<CouponDto, string>({
      query: (id) => ({ url: `/coupons/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: ['Coupon'],
    }),

    bulkGenerateCoupons: builder.mutation<CouponDto[], {
      count: number;
      prefix?: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      minOrderCents?: number;
      maxUsagePerCode?: number;
      expiresAt?: string;
    }>({
      query: (body) => ({ url: '/coupons/admin/bulk-generate', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetAdminCouponsQuery,
  useGetAdminCouponStatsQuery,
  useCreateCouponMutation,
  useDeactivateCouponMutation,
  useBulkGenerateCouponsMutation,
} = couponsApi;
