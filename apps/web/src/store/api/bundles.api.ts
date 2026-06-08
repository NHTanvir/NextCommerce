import { apiSlice } from '../api.slice';

export interface BundleDto {
  id: string;
  name: string;
  description: string | null;
  productIds: string[];
  discountPercent: number;
  discountAmountCents: number | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBundleInput {
  name: string;
  description?: string;
  productIds: string[];
  discountPercent: number;
  discountAmountCents?: number;
  startsAt?: string;
  endsAt?: string;
}

export const bundlesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getActiveBundles: build.query<BundleDto[], void>({
      query: () => '/bundles',
      providesTags: [{ type: 'Product' as const, id: 'bundles' }],
    }),

    getAllBundles: build.query<BundleDto[], { includeInactive?: boolean }>({
      query: ({ includeInactive }) =>
        `/bundles/all${includeInactive ? '?includeInactive=true' : ''}`,
      providesTags: [{ type: 'Product' as const, id: 'bundles-admin' }],
    }),

    getBundlesForProduct: build.query<BundleDto[], string>({
      query: (productId) => `/bundles/product/${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'Product' as const, id: `bundles-${productId}` }],
    }),

    getBundle: build.query<BundleDto, string>({
      query: (id) => `/bundles/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product' as const, id: `bundle-${id}` }],
    }),

    createBundle: build.mutation<BundleDto, CreateBundleInput>({
      query: (body) => ({ url: '/bundles', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Product' as const, id: 'bundles' },
        { type: 'Product' as const, id: 'bundles-admin' },
      ],
    }),

    updateBundle: build.mutation<BundleDto, { id: string } & Partial<CreateBundleInput>>({
      query: ({ id, ...body }) => ({ url: `/bundles/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product' as const, id: 'bundles' },
        { type: 'Product' as const, id: 'bundles-admin' },
        { type: 'Product' as const, id: `bundle-${id}` },
      ],
    }),

    deactivateBundle: build.mutation<BundleDto, string>({
      query: (id) => ({ url: `/bundles/${id}/deactivate`, method: 'PATCH' }),
      invalidatesTags: [
        { type: 'Product' as const, id: 'bundles' },
        { type: 'Product' as const, id: 'bundles-admin' },
      ],
    }),

    deleteBundle: build.mutation<void, string>({
      query: (id) => ({ url: `/bundles/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Product' as const, id: 'bundles' },
        { type: 'Product' as const, id: 'bundles-admin' },
      ],
    }),

    getBundleStats: build.query<{
      total: number; active: number; inactive: number; avgDiscountPercent: number; expiringSoon: number;
    }, void>({
      query: () => '/bundles/admin/stats',
      providesTags: [{ type: 'Product' as const, id: 'bundles-admin' }],
    }),
  }),
});

export const {
  useGetActiveBundlesQuery,
  useGetAllBundlesQuery,
  useGetBundlesForProductQuery,
  useGetBundleQuery,
  useCreateBundleMutation,
  useUpdateBundleMutation,
  useDeactivateBundleMutation,
  useDeleteBundleMutation,
  useGetBundleStatsQuery,
} = bundlesApi;
