import { apiSlice } from '../api.slice';

export interface DashboardSummary {
  totalRevenueCents: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValueCents: number;
  pendingOrders: number;
}

export interface RevenueByDay {
  date: string;
  totalCents: number;
  orderCount: number;
}

export interface TopProduct {
  productTitle: string;
  totalQuantity: number;
  totalRevenueCents: number;
}

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query<DashboardSummary, void>({
      query: () => '/analytics/summary',
    }),

    getRevenueByDay: build.query<RevenueByDay[], number | void>({
      query: (days = 30) => `/analytics/revenue?days=${days}`,
    }),

    getTopProducts: build.query<TopProduct[], number | void>({
      query: (limit = 10) => `/analytics/top-products?limit=${limit}`,
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRevenueByDayQuery,
  useGetTopProductsQuery,
} = analyticsApi;
