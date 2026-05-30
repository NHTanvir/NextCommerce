import { apiSlice } from '../api.slice';
import type { OrderDto, OrderStatus } from '@nextcommerce/shared';

export interface CreateOrderDto {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postalCode: string;
  anonymousToken?: string;
}

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<OrderDto, CreateOrderDto>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    getOrders: build.query<OrderDto[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),

    getOrder: build.query<OrderDto, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order' as const, id }],
    }),

    updateOrderStatus: build.mutation<OrderDto, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Order' as const, id }, 'Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
