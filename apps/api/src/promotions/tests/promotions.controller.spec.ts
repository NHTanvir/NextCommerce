import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsController } from '../promotions.controller';
import { PromotionsService } from '../promotions.service';

const mockPromo = {
  id: 'promo-1',
  name: 'Summer Sale',
  discountType: 'percentage',
  discountValue: 20,
  isActive: true,
  startsAt: null,
  endsAt: null,
};

const mockService: Partial<PromotionsService> = {
  findActive: jest.fn().mockResolvedValue([mockPromo]),
  findAll: jest.fn().mockResolvedValue([mockPromo]),
  findOne: jest.fn().mockResolvedValue(mockPromo),
  create: jest.fn().mockResolvedValue(mockPromo),
  update: jest.fn().mockResolvedValue({ ...mockPromo, name: 'Winter Sale' }),
  deactivate: jest.fn().mockResolvedValue({ ...mockPromo, isActive: false }),
  remove: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockResolvedValue({ total: 3, active: 2, inactive: 1 }),
};

describe('PromotionsController', () => {
  let controller: PromotionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionsController],
      providers: [{ provide: PromotionsService, useValue: mockService }],
    }).compile();

    controller = module.get(PromotionsController);
    jest.clearAllMocks();
  });

  it('findActive() returns active promotions', async () => {
    const result = await controller.findActive();
    expect(mockService.findActive).toHaveBeenCalled();
    expect(result).toEqual([mockPromo]);
  });

  it('findAll() delegates to service', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne() delegates id', async () => {
    await controller.findOne('promo-1');
    expect(mockService.findOne).toHaveBeenCalledWith('promo-1');
  });

  it('create() delegates dto', async () => {
    const dto = { name: 'Flash Sale', discountType: 'fixed', discountValue: 10 } as any;
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('update() delegates id and dto', async () => {
    const dto = { name: 'Updated Sale' } as any;
    await controller.update('promo-1', dto);
    expect(mockService.update).toHaveBeenCalledWith('promo-1', dto);
  });

  it('deactivate() sets isActive false', async () => {
    const result = await controller.deactivate('promo-1');
    expect(mockService.deactivate).toHaveBeenCalledWith('promo-1');
    expect((result as any).isActive).toBe(false);
  });

  it('remove() delegates id', async () => {
    await controller.remove('promo-1');
    expect(mockService.remove).toHaveBeenCalledWith('promo-1');
  });

  it('getStats() returns stats', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });
});
