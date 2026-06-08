import { apiSlice } from '../api.slice';

export interface TagWithCount {
  name: string;
  productCount: number;
}

export const tagsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
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
  }),
});

export const {
  useGetAdminTagsOverviewQuery,
  useAddTagToProductMutation,
  useRemoveTagGloballyMutation,
} = tagsApi;
