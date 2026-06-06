import { apiSlice } from '../api.slice';
import type { ProductListResponse, ProductDto, CategoryDto } from '@nextcommerce/shared';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
}

export interface RecommendedProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  imageUrl?: string;
  categoryName?: string;
  reason: 'same_brand' | 'same_category' | 'popular';
}

export interface RecommendationResult {
  products: RecommendedProduct[];
}

export const catalogApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<ProductListResponse, ProductQueryParams>({
      query: (params = {}) => ({
        url: '/catalog/products',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: build.query<ProductDto, string>({
      query: (slug) => `/catalog/products/${slug}`,
      providesTags: (_result, _err, slug) => [{ type: 'Product', id: slug }],
    }),

    getCategories: build.query<CategoryDto[], void>({
      query: () => '/catalog/categories',
      providesTags: [{ type: 'Category' as const, id: 'LIST' }],
    }),

    getRelatedProducts: build.query<RecommendationResult, { id: string; limit?: number }>({
      query: ({ id, limit = 8 }) => `/catalog/products/${id}/related?limit=${limit}`,
      providesTags: (_result, _err, { id }) => [{ type: 'Product', id: `related-${id}` }],
    }),

    getTrendingProducts: build.query<RecommendationResult, number | void>({
      query: (limit = 8) => `/catalog/trending?limit=${limit}`,
      providesTags: [{ type: 'Product', id: 'trending' }],
    }),

    getProductById: build.query<ProductDto, string>({
      query: (id) => `/catalog/products/id/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product' as const, id }],
    }),

    updateProduct: build.mutation<ProductDto, { id: string } & Partial<{
      title: string;
      description: string;
      brand: string;
      slug: string;
      basePriceCents: number;
      salePriceCents: number;
      categoryId: string;
      isActive: boolean;
      images: Array<{ url: string; alt: string }>;
    }>>({
      query: ({ id, ...body }) => ({
        url: `/catalog/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product' as const, id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deactivateProduct: build.mutation<void, string>({
      query: (id) => ({
        url: `/catalog/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Product' as const, id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    getBrands: build.query<Array<{ brand: string; productCount: number }>, void>({
      query: () => '/catalog/brands',
      providesTags: [{ type: 'Category' as const, id: 'brands' }],
    }),

    getDeals: build.query<
      { data: Array<ProductDto & { salePriceCents: number | null; discountPct: number }>; total: number; page: number; totalPages: number },
      { minDiscount?: number; limit?: number; page?: number }
    >({
      query: ({ minDiscount = 0, limit = 20, page = 1 } = {}) => ({
        url: '/catalog/deals',
        params: { minDiscount, limit, page },
      }),
      providesTags: [{ type: 'Product', id: 'deals' }],
    }),

    getNewArrivals: build.query<ProductDto[], { days?: number; limit?: number } | void>({
      query: (params = {}) => ({
        url: '/catalog/new-arrivals',
        params,
      }),
      providesTags: [{ type: 'Product', id: 'new-arrivals' }],
    }),

    getFeaturedProducts: build.query<ProductDto[], number | void>({
      query: (limit = 12) => `/catalog/featured?limit=${limit}`,
      providesTags: [{ type: 'Product', id: 'featured' }],
    }),

    getSearchSuggestions: build.query<
      Array<{ id: string; slug: string; title: string; brand: string; priceCents: number }>,
      { q: string; limit?: number }
    >({
      query: ({ q, limit = 8 }) => `/catalog/search/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetRelatedProductsQuery,
  useGetTrendingProductsQuery,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useDeactivateProductMutation,
  useGetBrandsQuery,
  useGetDealsQuery,
  useGetNewArrivalsQuery,
  useGetFeaturedProductsQuery,
  useGetSearchSuggestionsQuery,
} = catalogApi;
