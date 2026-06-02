import { apiSlice } from '../api.slice';

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ReturnReason = 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';

export interface ReturnRequest {
  id: string;
  userId: string;
  orderId: string;
  reason: ReturnReason;
  notes: string | null;
  status: ReturnStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateReturnRequest {
  orderId: string;
  reason: ReturnReason;
  notes?: string;
}

export const returnsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMyReturns: build.query<ReturnRequest[], void>({
      query: () => '/returns/my',
      providesTags: ['Returns'],
    }),

    createReturn: build.mutation<ReturnRequest, CreateReturnRequest>({
      query: (body) => ({ url: '/returns', method: 'POST', body }),
      invalidatesTags: ['Returns'],
    }),

    getAdminReturns: build.query<ReturnRequest[], { status?: ReturnStatus } | void>({
      query: (params) => {
        const status = params && 'status' in params ? params.status : undefined;
        return status ? `/returns?status=${status}` : '/returns';
      },
      providesTags: ['Returns'],
    }),

    updateReturnStatus: build.mutation<ReturnRequest, { id: string; status: ReturnStatus; adminNotes?: string }>({
      query: ({ id, ...body }) => ({ url: `/returns/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Returns'],
    }),
  }),
});

export const {
  useGetMyReturnsQuery,
  useCreateReturnMutation,
  useGetAdminReturnsQuery,
  useUpdateReturnStatusMutation,
} = returnsApi;
