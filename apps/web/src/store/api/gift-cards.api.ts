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
  }),
});

export const {
  useCheckGiftCardBalanceQuery,
  usePurchaseGiftCardMutation,
  useApplyGiftCardMutation,
  useGetMyGiftCardsQuery,
} = giftCardsApi;
