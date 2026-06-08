import { apiSlice } from '../api.slice';

export interface ProductSpecDto {
  id: string;
  productId: string;
  key: string;
  value: string;
  sortOrder: number;
  group: string | null;
  createdAt: string;
}

export interface GroupedSpecs {
  [group: string]: Array<{ key: string; value: string; id: string }>;
}

export const productSpecsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProductSpecs: build.query<ProductSpecDto[], string>({
      query: (productId) => `/products/${productId}/specs`,
      providesTags: (_r, _e, productId) => [{ type: 'Product' as const, id: `specs-${productId}` }],
    }),

    getGroupedSpecs: build.query<GroupedSpecs, string>({
      query: (productId) => `/products/${productId}/specs/grouped`,
      providesTags: (_r, _e, productId) => [{ type: 'Product' as const, id: `specs-${productId}` }],
    }),

    setSpec: build.mutation<ProductSpecDto, { productId: string; key: string; value: string; group?: string; sortOrder?: number }>({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/specs`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Product' as const, id: `specs-${productId}` },
      ],
    }),

    deleteSpec: build.mutation<void, { productId: string; specId: string }>({
      query: ({ productId, specId }) => ({
        url: `/products/${productId}/specs/${specId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Product' as const, id: `specs-${productId}` },
      ],
    }),

    bulkSetSpecs: build.mutation<ProductSpecDto[], {
      productId: string;
      specs: Array<{ key: string; value: string; group?: string; sortOrder?: number }>;
    }>({
      query: ({ productId, specs }) => ({
        url: `/products/${productId}/specs/bulk`,
        method: 'POST',
        body: { specs },
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Product' as const, id: `specs-${productId}` },
      ],
    }),
  }),
});

export const {
  useGetProductSpecsQuery,
  useGetGroupedSpecsQuery,
  useSetSpecMutation,
  useDeleteSpecMutation,
  useBulkSetSpecsMutation,
} = productSpecsApi;
