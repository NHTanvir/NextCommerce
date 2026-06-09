import { apiSlice } from '../api.slice';

export interface CartItemDto {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  slug: string;
  size: number;
  color: string;
  priceCents: number;
  quantity: number;
  imageUrl: string;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  totalCents: number;
}

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<CartDto, string | undefined>({
      query: (anonymousToken) => ({
        url: '/cart',
        headers: anonymousToken ? { 'x-cart-token': anonymousToken } : {},
      }),
      providesTags: ['Cart'],
    }),

    addToCart: build.mutation<CartDto, { variantId: string; quantity: number; anonymousToken?: string }>({
      query: ({ variantId, quantity, anonymousToken }) => ({
        url: '/cart/items',
        method: 'POST',
        body: { variantId, quantity },
        headers: anonymousToken ? { 'x-cart-token': anonymousToken } : {},
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: build.mutation<CartDto, { variantId: string; quantity: number; anonymousToken?: string }>({
      query: ({ variantId, quantity, anonymousToken }) => ({
        url: `/cart/items/${variantId}`,
        method: 'PATCH',
        body: { quantity },
        headers: anonymousToken ? { 'x-cart-token': anonymousToken } : {},
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: build.mutation<CartDto, { variantId: string; anonymousToken?: string }>({
      query: ({ variantId, anonymousToken }) => ({
        url: `/cart/items/${variantId}`,
        method: 'DELETE',
        headers: anonymousToken ? { 'x-cart-token': anonymousToken } : {},
      }),
      invalidatesTags: ['Cart'],
    }),

    mergeCart: build.mutation<CartDto, { anonymousToken: string }>({
      query: (body) => ({ url: '/cart/merge', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useMergeCartMutation,
} = cartApi;
