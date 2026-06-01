import { Test, TestingModule } from '@nestjs/testing';
import { ShippingService } from '../shipping.service';

describe('ShippingService', () => {
  let service: ShippingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShippingService],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
  });

  describe('getEstimate', () => {
    it('returns 3 shipping rates', () => {
      const result = service.getEstimate(5000);
      expect(result.rates).toHaveLength(3);
    });

    it('makes standard shipping free when order total >= $100', () => {
      const result = service.getEstimate(10000);
      const standard = result.rates.find((r) => r.id === 'standard');
      expect(standard?.priceCents).toBe(0);
      expect(standard?.isFree).toBe(true);
    });

    it('standard shipping has a cost when order total < $100', () => {
      const result = service.getEstimate(5000);
      const standard = result.rates.find((r) => r.id === 'standard');
      expect(standard?.priceCents).toBeGreaterThan(0);
      expect(standard?.isFree).toBe(false);
    });

    it('express and overnight shipping always have a cost', () => {
      const result = service.getEstimate(50000);
      const express = result.rates.find((r) => r.id === 'express');
      const overnight = result.rates.find((r) => r.id === 'overnight');
      expect(express?.priceCents).toBeGreaterThan(0);
      expect(overnight?.priceCents).toBeGreaterThan(0);
    });

    it('returns USD currency', () => {
      expect(service.getEstimate(5000).currency).toBe('USD');
    });
  });

  describe('getRateById', () => {
    it('returns correct rate by id', () => {
      const rate = service.getRateById('express', 5000);
      expect(rate?.id).toBe('express');
    });

    it('returns null for unknown rateId', () => {
      const rate = service.getRateById('invalid-rate', 5000);
      expect(rate).toBeNull();
    });
  });

  describe('calculateDeliveryDate', () => {
    it('returns a future date', () => {
      const date = service.calculateDeliveryDate('standard');
      expect(date.getTime()).toBeGreaterThan(Date.now());
    });

    it('overnight is sooner than standard', () => {
      const overnight = service.calculateDeliveryDate('overnight');
      const standard = service.calculateDeliveryDate('standard');
      expect(overnight.getTime()).toBeLessThan(standard.getTime());
    });

    it('skips weekends', () => {
      const date = service.calculateDeliveryDate('overnight');
      const day = date.getDay();
      expect(day).not.toBe(0);
      expect(day).not.toBe(6);
    });
  });
});
