import { apiSlice } from '../api.slice';

export const newsletterApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    subscribe: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/newsletter/subscribe', method: 'POST', body }),
    }),

    unsubscribe: build.mutation<void, { email: string }>({
      query: (body) => ({ url: '/newsletter/unsubscribe', method: 'POST', body }),
    }),
  }),
});

export const { useSubscribeMutation, useUnsubscribeMutation } = newsletterApi;
