import { apiSlice } from '../api.slice';

export interface ShippingRate {
  id: string;
  name: string;
  carrier: string;
  deliveryDays: string;
  priceCents: number;
  isFree: boolean;
}

export interface ShippingEstimate {
  rates: ShippingRate[];
  currency: 'USD';
}

export const shippingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShippingRates: builder.query<ShippingEstimate, { total: number; country?: string }>({
      query: ({ total, country = 'US' }) =>
        `/shipping/rates?total=${total}&country=${country}`,
    }),
    getDeliveryDate: builder.query<{ rateId: string; estimatedDelivery: string }, string>({
      query: (rateId) => `/shipping/delivery-date?rateId=${rateId}`,
    }),
  }),
});

export const { useGetShippingRatesQuery, useGetDeliveryDateQuery } = shippingApi;
