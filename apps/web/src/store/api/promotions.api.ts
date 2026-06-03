import { apiSlice } from './index';

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  applicableCategories: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionPayload {
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
  applicableCategories?: string[];
}

export const promotionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivePromotions: builder.query<Promotion[], void>({
      query: () => '/promotions/active',
      providesTags: ['Promotions'],
    }),
    getAdminPromotions: builder.query<Promotion[], void>({
      query: () => '/promotions',
      providesTags: ['Promotions'],
    }),
    createPromotion: builder.mutation<Promotion, CreatePromotionPayload>({
      query: (body) => ({ url: '/promotions', method: 'POST', body }),
      invalidatesTags: ['Promotions'],
    }),
    updatePromotion: builder.mutation<Promotion, { id: string } & Partial<CreatePromotionPayload>>({
      query: ({ id, ...body }) => ({ url: `/promotions/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Promotions'],
    }),
    deactivatePromotion: builder.mutation<Promotion, string>({
      query: (id) => ({ url: `/promotions/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: ['Promotions'],
    }),
    deletePromotion: builder.mutation<void, string>({
      query: (id) => ({ url: `/promotions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Promotions'],
    }),
  }),
});

export const {
  useGetActivePromotionsQuery,
  useGetAdminPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeactivatePromotionMutation,
  useDeletePromotionMutation,
} = promotionsApi;
