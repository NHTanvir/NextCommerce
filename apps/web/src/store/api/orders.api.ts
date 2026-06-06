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

    updateOrderStatus: build.mutation<OrderDto, { id: string; status: OrderStatus; trackingNumber?: string; carrier?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Order' as const, id }, 'Order'],
    }),

    bulkFulfillOrders: build.mutation<{ success: number; errors: string[] }, { orderIds: string[]; status: OrderStatus }>({
      query: (body) => ({ url: '/orders/admin/bulk-fulfill', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),

    getAdminOrders: build.query<{ data: OrderDto[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `/orders/admin/all?page=${page}&limit=${limit}`,
      providesTags: ['Order'],
    }),

    getOrdersForUser: build.query<OrderDto[], string>({
      query: (userId) => `/orders/admin/user/${userId}`,
      providesTags: (_r, _e, userId) => [{ type: 'Order' as const, id: `user-${userId}` }],
    }),

    getOrderStatusBreakdown: build.query<Array<{ status: string; count: number; totalCents: number }>, void>({
      query: () => '/orders/admin/status-breakdown',
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useBulkFulfillOrdersMutation,
  useGetAdminOrdersQuery,
  useGetOrdersForUserQuery,
  useGetOrderStatusBreakdownQuery,
} = ordersApi;
