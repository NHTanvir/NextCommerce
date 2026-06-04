import { apiSlice } from '../api.slice';

export interface AnswerDto {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  isAdminAnswer: boolean;
  createdAt: string;
}

export interface QuestionDto {
  id: string;
  productId: string;
  userId: string;
  body: string;
  isAnswered: boolean;
  isHidden: boolean;
  answers: AnswerDto[];
  createdAt: string;
}

export interface AdminQnaResponse {
  data: QuestionDto[];
  total: number;
}

export const qnaApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProductQna: build.query<QuestionDto[], string>({
      query: (productId) => `/qna?productId=${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'Product' as const, id: `qna-${productId}` }],
    }),

    getProductQnaAdmin: build.query<AdminQnaResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => `/qna/admin/all?page=${page}&limit=${limit}`,
      providesTags: [{ type: 'Product' as const, id: 'qna-admin' }],
    }),

    askQuestion: build.mutation<QuestionDto, { productId: string; body: string }>({
      query: (body) => ({ url: '/qna/ask', method: 'POST', body }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Product' as const, id: `qna-${productId}` }],
    }),

    answerQuestion: build.mutation<AnswerDto, { questionId: string; body: string }>({
      query: ({ questionId, body }) => ({ url: `/qna/${questionId}/answer`, method: 'POST', body: { body } }),
      invalidatesTags: () => [
        { type: 'Product' as const, id: 'qna' },
        { type: 'Product' as const, id: 'qna-admin' },
      ],
    }),

    hideQuestion: build.mutation<QuestionDto, string>({
      query: (id) => ({ url: `/qna/${id}/hide`, method: 'PATCH' }),
      invalidatesTags: () => [{ type: 'Product' as const, id: 'qna-admin' }],
    }),

    deleteQuestion: build.mutation<void, { id: string; productId: string }>({
      query: ({ id }) => ({ url: `/qna/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Product' as const, id: `qna-${productId}` },
        { type: 'Product' as const, id: 'qna-admin' },
      ],
    }),
  }),
});

export const {
  useGetProductQnaQuery,
  useGetProductQnaAdminQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
  useHideQuestionMutation,
  useDeleteQuestionMutation,
} = qnaApi;
