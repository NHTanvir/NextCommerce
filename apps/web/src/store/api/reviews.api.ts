import { apiSlice } from '../api.slice';

export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
}

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<ReviewDto[], string>({
      query: (productId) => `/reviews?productId=${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'Review' as const, id: productId }],
    }),

    createReview: build.mutation<ReviewDto, CreateReviewDto>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Review' as const, id: productId }],
    }),
  }),
});

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewsApi;
