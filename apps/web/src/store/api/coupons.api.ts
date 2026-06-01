import { apiSlice } from '../api.slice';

export interface CouponValidationResult {
  valid: boolean;
  discountCents: number;
  couponId: string;
  message?: string;
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
  }),
});

export const { useValidateCouponMutation } = couponsApi;
