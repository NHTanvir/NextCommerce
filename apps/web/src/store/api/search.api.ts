import { apiSlice } from '../api.slice';

export interface SearchResultItem {
  type: 'product' | 'category';
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  brand?: string;
  basePriceCents?: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResultItem[];
}

export interface TrendingTerm {
  term: string;
  count?: number;
}

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    search: build.query<SearchResponse, { q: string; limit?: number }>({
      query: ({ q, limit = 20 }) => `/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    }),

    autocomplete: build.query<SearchResultItem[], string>({
      query: (q) => `/search/autocomplete?q=${encodeURIComponent(q)}`,
    }),

    getTrendingSearches: build.query<TrendingTerm[], number | void>({
      query: (limit = 8) => `/search/trending?limit=${limit}`,
    }),

    searchByBrand: build.query<SearchResponse, { q: string; limit?: number }>({
      query: ({ q, limit = 20 }) => `/search/brand?q=${encodeURIComponent(q)}&limit=${limit}`,
    }),
  }),
});

export const {
  useSearchQuery,
  useLazySearchQuery,
  useAutocompleteQuery,
  useLazyAutocompleteQuery,
  useGetTrendingSearchesQuery,
  useSearchByBrandQuery,
} = searchApi;
