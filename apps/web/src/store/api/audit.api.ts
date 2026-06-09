import { apiSlice } from '../api.slice';

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceId: string | null;
  resourceType: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export const auditApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyActivity: build.query<AuditLog[], number | void>({
      query: (limit = 50) => `/audit/me?limit=${limit}`,
      providesTags: ['AuditLog'],
    }),

    getAuditLogs: build.query<AuditLog[], { limit?: number; action?: string }>({
      query: ({ limit = 100, action } = {}) => {
        const params = new URLSearchParams({ limit: String(limit) });
        if (action && action !== 'all') {
          params.set('action', action);
          return `/audit/action?${params}`;
        }
        return `/audit?${params}`;
      },
      providesTags: ['AuditLog'],
    }),

    getAuditStats: build.query<{
      total: number;
      last24h: number;
      byAction: Array<{ action: string; count: number }>;
    }, void>({
      query: () => '/audit/stats',
      providesTags: ['AuditLog'],
    }),
  }),
});

export const { useGetMyActivityQuery, useGetAuditLogsQuery, useGetAuditStatsQuery } = auditApi;
