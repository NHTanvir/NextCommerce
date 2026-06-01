import { Injectable } from '@nestjs/common';

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

const FREE_SHIPPING_THRESHOLD_CENTS = 10000;

@Injectable()
export class ShippingService {
  private readonly rates: ShippingRate[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      carrier: 'USPS',
      deliveryDays: '5-7 business days',
      priceCents: 499,
      isFree: false,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      carrier: 'FedEx',
      deliveryDays: '2-3 business days',
      priceCents: 999,
      isFree: false,
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      carrier: 'UPS',
      deliveryDays: '1 business day',
      priceCents: 1999,
      isFree: false,
    },
  ];

  getEstimate(orderTotalCents: number, _countryCode = 'US'): ShippingEstimate {
    const rates = this.rates.map((rate) => {
      if (rate.id === 'standard' && orderTotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
        return { ...rate, priceCents: 0, isFree: true, name: 'Free Standard Shipping' };
      }
      return rate;
    });

    return { rates, currency: 'USD' };
  }

  getRateById(rateId: string, orderTotalCents: number): ShippingRate | null {
    const estimate = this.getEstimate(orderTotalCents);
    return estimate.rates.find((r) => r.id === rateId) ?? null;
  }

  calculateDeliveryDate(rateId: string): Date {
    const businessDaysMap: Record<string, number> = {
      standard: 7,
      express: 3,
      overnight: 1,
    };
    const daysToAdd = businessDaysMap[rateId] ?? 7;
    const date = new Date();
    let added = 0;
    while (added < daysToAdd) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return date;
  }
}
