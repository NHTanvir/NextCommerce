import { apiSlice } from '../api.slice';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export interface NewsletterSubscribersData {
  data: NewsletterSubscriber[];
  total: number;
  activeCount: number;
}

export interface NewsletterStats {
  total: number;
  active: number;
  inactive: number;
  recentlyAdded: number;
}

export const newsletterApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    subscribe: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/newsletter/subscribe', method: 'POST', body }),
    }),

    unsubscribe: build.mutation<void, { email: string }>({
      query: (body) => ({ url: '/newsletter/unsubscribe', method: 'POST', body }),
    }),

    getNewsletterStats: build.query<NewsletterStats, void>({
      query: () => '/newsletter/stats',
      providesTags: ['Newsletter'],
    }),

    getNewsletterSubscribers: build.query<NewsletterSubscribersData, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 50 }) => `/newsletter/subscribers?page=${page}&limit=${limit}`,
      providesTags: ['Newsletter'],
    }),
  }),
});

export const {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetNewsletterStatsQuery,
  useGetNewsletterSubscribersQuery,
} = newsletterApi;
