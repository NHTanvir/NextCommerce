import { apiSlice } from '../api.slice';

export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  title: string;
  body: string;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface AdminReviewsResponse {
  data: ReviewDto[];
  total: number;
}

export interface ReviewVoteCounts {
  helpfulCount: number;
  notHelpfulCount: number;
}

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<ReviewDto[], string>({
      query: (productId) => `/reviews?productId=${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'Review' as const, id: productId }],
    }),

    getRatingDistribution: build.query<RatingDistribution, string>({
      query: (productId) => `/reviews/distribution?productId=${productId}`,
      providesTags: (_r, _e, productId) => [{ type: 'Review' as const, id: `dist-${productId}` }],
    }),

    getAdminReviews: build.query<AdminReviewsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `/reviews/admin?page=${page}&limit=${limit}`,
      providesTags: [{ type: 'Review' as const, id: 'ADMIN_LIST' }],
    }),

    createReview: build.mutation<ReviewDto, CreateReviewDto>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Review' as const, id: productId },
        { type: 'Review' as const, id: `dist-${productId}` },
      ],
    }),

    deleteReview: build.mutation<void, { id: string; productId: string }>({
      query: ({ id }) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Review' as const, id: productId },
        { type: 'Review' as const, id: `dist-${productId}` },
        { type: 'Review' as const, id: 'ADMIN_LIST' },
      ],
    }),

    getReviewVotes: build.query<ReviewVoteCounts, string>({
      query: (reviewId) => `/reviews/${reviewId}/votes`,
      providesTags: (_r, _e, reviewId) => [{ type: 'Review' as const, id: `votes-${reviewId}` }],
    }),

    voteReview: build.mutation<ReviewVoteCounts, { reviewId: string; isHelpful: boolean }>({
      query: ({ reviewId, isHelpful }) => ({
        url: `/reviews/${reviewId}/vote`,
        method: 'PATCH',
        body: { isHelpful },
      }),
      invalidatesTags: (_r, _e, { reviewId }) => [
        { type: 'Review' as const, id: `votes-${reviewId}` },
      ],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetRatingDistributionQuery,
  useGetAdminReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetReviewVotesQuery,
  useVoteReviewMutation,
} = reviewsApi;
