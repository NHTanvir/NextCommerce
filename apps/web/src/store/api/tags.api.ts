import { apiSlice } from '../api.slice';

export interface TagWithCount {
  name: string;
  productCount: number;
}

export const tagsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllTags: build.query<string[], void>({
      query: () => '/tags',
      providesTags: ['Tag'],
    }),

    getAdminTagsOverview: build.query<TagWithCount[], void>({
      query: () => '/tags/admin/overview',
      providesTags: ['Tag'],
    }),

    addTagToProduct: build.mutation<void, { productId: string; name: string }>({
      query: ({ productId, name }) => ({
        url: `/tags/${productId}/${encodeURIComponent(name)}`,
        method: 'POST',
      }),
      invalidatesTags: ['Tag'],
    }),

    removeTagGlobally: build.mutation<void, string>({
      query: (name) => ({
        url: `/tags/admin/name/${encodeURIComponent(name)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tag'],
    }),

    removeTagFromProduct: build.mutation<void, { productId: string; name: string }>({
      query: ({ productId, name }) => ({
        url: `/tags/${productId}/${encodeURIComponent(name)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tag'],
    }),

    getProductsByTag: build.query<string[], string>({
      query: (tag) => `/tags/products?tag=${encodeURIComponent(tag)}`,
      providesTags: (_r, _e, tag) => [{ type: 'Tag' as const, id: `tag-${tag}` }],
    }),
  }),
});

export const {
  useGetAllTagsQuery,
  useGetAdminTagsOverviewQuery,
  useAddTagToProductMutation,
  useRemoveTagGloballyMutation,
  useRemoveTagFromProductMutation,
  useGetProductsByTagQuery,
} = tagsApi;
