import { apiSlice } from '../api.slice';

export interface WishlistItemResponse {
  id: string;
  userId: string;
  productId: string;
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string;
    basePriceCents: number;
    images: Array<{ url: string; alt: string }>;
  };
  addedAt: string;
}

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<WishlistItemResponse[], void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    addToWishlistApi: build.mutation<WishlistItemResponse, string>({
      query: (productId) => ({ url: `/wishlist/${productId}`, method: 'POST' }),
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlistApi: build.mutation<void, string>({
      query: (productId) => ({ url: `/wishlist/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Wishlist'],
    }),

    toggleWishlistApi: build.mutation<{ wishlisted: boolean }, string>({
      query: (productId) => ({ url: `/wishlist/${productId}/toggle`, method: 'POST' }),
      invalidatesTags: ['Wishlist'],
    }),

    getMostWishlisted: build.query<Array<{ productId: string; count: number }>, number | void>({
      query: (limit = 10) => `/wishlist/admin/most-wishlisted?limit=${limit}`,
    }),

    getProductWishlistCount: build.query<number, string>({
      query: (productId) => `/wishlist/count/${productId}`,
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistApiMutation,
  useRemoveFromWishlistApiMutation,
  useToggleWishlistApiMutation,
  useGetMostWishlistedQuery,
  useGetProductWishlistCountQuery,
} = wishlistApi;
