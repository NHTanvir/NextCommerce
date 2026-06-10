import { Test, TestingModule } from '@nestjs/testing';
import { ShippingController } from '../shipping.controller';
import { ShippingService } from '../shipping.service';

const futureDate = new Date('2025-06-15T00:00:00.000Z');

const mockService: Partial<ShippingService> = {
  getEstimate: jest.fn().mockResolvedValue([
    { id: 'standard', name: 'Standard Shipping', priceCents: 499, days: 5 },
    { id: 'express', name: 'Express', priceCents: 1299, days: 2 },
  ]),
  calculateDeliveryDate: jest.fn().mockReturnValue(futureDate),
};

describe('ShippingController', () => {
  let controller: ShippingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingController],
      providers: [{ provide: ShippingService, useValue: mockService }],
    }).compile();

    controller = module.get(ShippingController);
    jest.clearAllMocks();
  });

  it('getRates() delegates parsed total and country to service', async () => {
    await controller.getRates('5000', 'CA');
    expect(mockService.getEstimate).toHaveBeenCalledWith(5000, 'CA');
  });

  it('getRates() uses default country US when not provided', async () => {
    await controller.getRates('5000');
    expect(mockService.getEstimate).toHaveBeenCalledWith(5000, 'US');
  });

  it('getDeliveryDate() returns { rateId, estimatedDelivery } shape', () => {
    (mockService.calculateDeliveryDate as jest.Mock).mockReturnValue(futureDate);
    const result = controller.getDeliveryDate('express');
    expect(mockService.calculateDeliveryDate).toHaveBeenCalledWith('express');
    expect(result).toEqual({ rateId: 'express', estimatedDelivery: futureDate.toISOString() });
  });
});
