import { apiSlice } from '../api.slice';

export interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImageUrl: string | null;
  productIds: string[];
  discountPercent: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export const collectionsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getActiveCollections: build.query<CollectionDto[], void>({
      query: () => '/collections',
      providesTags: [{ type: 'Product' as const, id: 'COLLECTIONS' }],
    }),

    getAllCollections: build.query<CollectionDto[], void>({
      query: () => '/collections/admin/all',
      providesTags: [{ type: 'Product' as const, id: 'COLLECTIONS_ALL' }],
    }),

    createCollection: build.mutation<CollectionDto, Partial<CollectionDto>>({
      query: (body) => ({ url: '/collections', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Product' as const, id: 'COLLECTIONS' },
        { type: 'Product' as const, id: 'COLLECTIONS_ALL' },
      ],
    }),

    updateCollection: build.mutation<CollectionDto, { id: string } & Partial<CollectionDto>>({
      query: ({ id, ...body }) => ({ url: `/collections/${id}`, method: 'PATCH', body }),
      invalidatesTags: [
        { type: 'Product' as const, id: 'COLLECTIONS' },
        { type: 'Product' as const, id: 'COLLECTIONS_ALL' },
      ],
    }),

    deleteCollection: build.mutation<void, string>({
      query: (id) => ({ url: `/collections/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Product' as const, id: 'COLLECTIONS' },
        { type: 'Product' as const, id: 'COLLECTIONS_ALL' },
      ],
    }),

    getCollectionStats: build.query<{
      total: number; active: number; inactive: number; withDiscount: number; expiringSoon: number;
    }, void>({
      query: () => '/collections/admin/stats',
      providesTags: [{ type: 'Product' as const, id: 'COLLECTIONS_ALL' }],
    }),
  }),
});

export const {
  useGetActiveCollectionsQuery,
  useGetAllCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionStatsQuery,
} = collectionsApi;
