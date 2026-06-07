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

export interface RepeatCustomerRate {
  totalCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  avgOrdersPerCustomer: number;
}

export interface RevenueByCat {
  categoryName: string;
  totalCents: number;
  orderCount: number;
}

export interface HourlyDistribution {
  hour: number;
  orderCount: number;
  totalCents: number;
}

export interface TopCustomer {
  userId: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: string;
}

export interface CustomerSegments {
  vip: number;
  loyal: number;
  regular: number;
  atRisk: number;
  lapsed: number;
}

export interface CohortData {
  cohortMonth: string;
  newCustomers: number;
  retainedAtMonth1: number;
  retainedAtMonth2: number;
  retainedAtMonth3: number;
}

export interface AovTrendPoint {
  date: string;
  avgOrderValueCents: number;
}

export interface WeekdayDistribution {
  weekday: number;
  weekdayName: string;
  orderCount: number;
  totalCents: number;
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

    getRepeatCustomerRate: build.query<RepeatCustomerRate, void>({
      query: () => '/analytics/repeat-customers',
    }),

    getRevenueByCat: build.query<RevenueByCat[], number | void>({
      query: (limit = 10) => `/analytics/revenue-by-category?limit=${limit}`,
    }),

    getHourlyDistribution: build.query<HourlyDistribution[], void>({
      query: () => '/analytics/hourly-distribution',
    }),

    getTopCustomers: build.query<TopCustomer[], number | void>({
      query: (limit = 10) => `/analytics/top-customers?limit=${limit}`,
    }),

    getCustomerSegments: build.query<CustomerSegments, void>({
      query: () => '/analytics/customer-segments',
    }),

    getCohortData: build.query<CohortData[], number | void>({
      query: (months = 6) => `/analytics/cohort?months=${months}`,
    }),

    getAovTrend: build.query<AovTrendPoint[], number | void>({
      query: (days = 30) => `/analytics/aov-trend?days=${days}`,
    }),

    getWeekdayDistribution: build.query<WeekdayDistribution[], void>({
      query: () => '/analytics/weekday-distribution',
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRevenueByDayQuery,
  useGetTopProductsQuery,
  useGetRepeatCustomerRateQuery,
  useGetRevenueByCatQuery,
  useGetHourlyDistributionQuery,
  useGetTopCustomersQuery,
  useGetCustomerSegmentsQuery,
  useGetCohortDataQuery,
  useGetAovTrendQuery,
  useGetWeekdayDistributionQuery,
} = analyticsApi;
