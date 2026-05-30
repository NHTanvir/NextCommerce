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

export const catalogApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<ProductListResponse, ProductQueryParams>({
      query: (params = {}) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProduct: build.query<ProductDto, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_result, _err, slug) => [{ type: 'Product', id: slug }],
    }),

    getCategories: build.query<CategoryDto[], void>({
      query: () => '/categories',
      providesTags: [{ type: 'Category' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
} = catalogApi;
