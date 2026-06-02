import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from '../coupons.controller';
import { CouponsService } from '../coupons.service';
import { CreateCouponDto } from '../dto/coupon.dto';

const mockService = {
  validate: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  deactivate: jest.fn(),
};

describe('CouponsController', () => {
  let controller: CouponsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [{ provide: CouponsService, useValue: mockService }],
    }).compile();

    controller = module.get(CouponsController);
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('delegates to service with code and total', async () => {
      const result = { valid: true, discountCents: 500 };
      mockService.validate.mockResolvedValue(result);
      const res = await controller.validate({ code: 'SAVE5', orderTotalCents: 10000 });
      expect(mockService.validate).toHaveBeenCalledWith('SAVE5', 10000);
      expect(res).toBe(result);
    });
  });

  describe('create', () => {
    it('creates and returns new coupon', async () => {
      const dto: CreateCouponDto = {
        code: 'NEWUSER10',
        discountType: 'percentage',
        discountValue: 10,
      } as CreateCouponDto;
      const coupon = { id: 'c1', ...dto };
      mockService.create.mockResolvedValue(coupon);
      const res = await controller.create(dto);
      expect(res).toBe(coupon);
    });
  });

  describe('findAll', () => {
    it('returns list of coupons', async () => {
      const coupons = [{ id: 'c1' }, { id: 'c2' }];
      mockService.findAll.mockResolvedValue(coupons);
      const res = await controller.findAll();
      expect(res).toBe(coupons);
    });
  });

  describe('deactivate', () => {
    it('calls service deactivate with id', async () => {
      const coupon = { id: 'c1', isActive: false };
      mockService.deactivate.mockResolvedValue(coupon);
      const res = await controller.deactivate('c1');
      expect(mockService.deactivate).toHaveBeenCalledWith('c1');
      expect(res).toBe(coupon);
    });
  });
});
