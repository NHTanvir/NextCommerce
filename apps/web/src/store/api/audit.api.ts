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
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
