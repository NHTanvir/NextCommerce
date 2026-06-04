import { apiSlice } from '../api.slice';

export type NotificationType =
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'return_approved'
  | 'return_rejected'
  | 'review_approved'
  | 'loyalty_points'
  | 'loyalty_tier_up'
  | 'gift_card_received'
  | 'price_drop'
  | 'back_in_stock'
  | 'flash_sale'
  | 'system';

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: NotificationDto[];
  unreadCount: number;
}

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationsResponse, { limit?: number } | void>({
      query: (args) => {
        const limit = args?.limit ?? 30;
        return `/notifications?limit=${limit}`;
      },
      providesTags: [{ type: 'User' as const, id: 'notifications' }],
    }),

    getUnreadCount: build.query<{ count: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'User' as const, id: 'notifications-count' }],
    }),

    markAsRead: build.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: [
        { type: 'User' as const, id: 'notifications' },
        { type: 'User' as const, id: 'notifications-count' },
      ],
    }),

    markAllAsRead: build.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: [
        { type: 'User' as const, id: 'notifications' },
        { type: 'User' as const, id: 'notifications-count' },
      ],
    }),

    deleteNotification: build.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'User' as const, id: 'notifications' },
        { type: 'User' as const, id: 'notifications-count' },
      ],
    }),

    deleteAllNotifications: build.mutation<void, void>({
      query: () => ({ url: '/notifications', method: 'DELETE' }),
      invalidatesTags: [
        { type: 'User' as const, id: 'notifications' },
        { type: 'User' as const, id: 'notifications-count' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} = notificationsApi;
