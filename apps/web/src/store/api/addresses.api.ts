import { apiSlice } from '../api.slice';

export interface Address {
  id: string;
  userId: string;
  line1: string;
  line2: string | null;
  city: string;
  country: string;
  postalCode: string;
}

export interface CreateAddressDto {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
}

export const addressesApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAddresses: build.query<Address[], void>({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),

    createAddress: build.mutation<Address, CreateAddressDto>({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      invalidatesTags: ['Address'],
    }),

    deleteAddress: build.mutation<void, string>({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
