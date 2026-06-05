import { apiSlice } from '../api.slice';

export interface NotificationPreferences {
  id: string;
  userId: string;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  lowStockAlerts: boolean;
  newsletterDigest: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
}

export interface UpdateNotificationPreferencesDto {
  orderUpdates?: boolean;
  promotionalEmails?: boolean;
  lowStockAlerts?: boolean;
  newsletterDigest?: boolean;
  pushNotifications?: boolean;
  smsAlerts?: boolean;
}

export const notificationPreferencesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getNotificationPreferences: build.query<NotificationPreferences, void>({
      query: () => '/notification-preferences',
      providesTags: [{ type: 'User' as const, id: 'notif-prefs' }],
    }),

    updateNotificationPreferences: build.mutation<NotificationPreferences, UpdateNotificationPreferencesDto>({
      query: (body) => ({ url: '/notification-preferences', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'User' as const, id: 'notif-prefs' }],
    }),

    resetNotificationPreferences: build.mutation<NotificationPreferences, void>({
      query: () => ({ url: '/notification-preferences', method: 'DELETE' }),
      invalidatesTags: [{ type: 'User' as const, id: 'notif-prefs' }],
    }),
  }),
});

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useResetNotificationPreferencesMutation,
} = notificationPreferencesApi;
