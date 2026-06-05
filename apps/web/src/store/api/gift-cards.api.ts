import { apiSlice } from '../api.slice';

export interface GiftCardDto {
  id: string;
  code: string;
  initialAmountCents: number;
  remainingAmountCents: number;
  isActive: boolean;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface GiftCardBalance {
  code: string;
  remaining: number;
  isValid: boolean;
  expiresAt: string | null;
}

export interface ApplyResult {
  discountCents: number;
  remainingAfter: number;
}

export interface AdminGiftCardList {
  data: GiftCardDto[];
  total: number;
  page: number;
  totalPages: number;
}

export const giftCardsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    checkGiftCardBalance: build.query<GiftCardBalance, string>({
      query: (code) => `/gift-cards/balance?code=${encodeURIComponent(code)}`,
    }),

    purchaseGiftCard: build.mutation<GiftCardDto, { amountCents: number; recipientEmail?: string; recipientName?: string; message?: string }>({
      query: (body) => ({ url: '/gift-cards/purchase', method: 'POST', body }),
    }),

    applyGiftCard: build.mutation<ApplyResult, { code: string; orderAmountCents: number }>({
      query: (body) => ({ url: '/gift-cards/apply', method: 'POST', body }),
    }),

    getMyGiftCards: build.query<GiftCardDto[], void>({
      query: () => '/gift-cards/my',
    }),

    adminGetGiftCards: build.query<AdminGiftCardList, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `/gift-cards/admin?page=${page}&limit=${limit}`,
      providesTags: ['GiftCards'],
    }),

    adminDeleteGiftCard: build.mutation<void, string>({
      query: (id) => ({ url: `/gift-cards/admin/${id}`, method: 'DELETE' }),
      invalidatesTags: ['GiftCards'],
    }),

    adminIssueGiftCard: build.mutation<GiftCardDto, { amountCents: number; recipientEmail?: string; recipientName?: string; message?: string; expiresAt?: string }>({
      query: (body) => ({ url: '/gift-cards/purchase', method: 'POST', body }),
      invalidatesTags: ['GiftCards'],
    }),
  }),
});

export const {
  useCheckGiftCardBalanceQuery,
  usePurchaseGiftCardMutation,
  useApplyGiftCardMutation,
  useGetMyGiftCardsQuery,
  useAdminGetGiftCardsQuery,
  useAdminDeleteGiftCardMutation,
  useAdminIssueGiftCardMutation,
} = giftCardsApi;
