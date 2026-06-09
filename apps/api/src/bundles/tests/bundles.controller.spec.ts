import { Test, TestingModule } from '@nestjs/testing';
import { BundlesController } from '../bundles.controller';
import { BundlesService } from '../bundles.service';

const mockBundle = {
  id: 'bundle-1',
  name: 'Starter Pack',
  description: null,
  productIds: ['p-1', 'p-2'],
  discountPercent: 15,
  discountAmountCents: null,
  isActive: true,
  startsAt: null,
  endsAt: null,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockService: Partial<BundlesService> = {
  findActive: jest.fn().mockResolvedValue([mockBundle]),
  findAll: jest.fn().mockResolvedValue([mockBundle]),
  findOne: jest.fn().mockResolvedValue(mockBundle),
  findBundlesForProduct: jest.fn().mockResolvedValue([mockBundle]),
  create: jest.fn().mockResolvedValue(mockBundle),
  update: jest.fn().mockResolvedValue({ ...mockBundle, name: 'Updated Pack' }),
  deactivate: jest.fn().mockResolvedValue({ ...mockBundle, isActive: false }),
  remove: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockResolvedValue({ total: 1, active: 1, inactive: 0, avgDiscountPercent: 15, expiringSoon: 0 }),
};

describe('BundlesController', () => {
  let controller: BundlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BundlesController],
      providers: [{ provide: BundlesService, useValue: mockService }],
    }).compile();

    controller = module.get(BundlesController);
    jest.clearAllMocks();
  });

  it('findActive() returns active bundles', async () => {
    const result = await controller.findActive();
    expect(mockService.findActive).toHaveBeenCalled();
    expect(result).toEqual([mockBundle]);
  });

  it('findAll() passes includeInactive as boolean', async () => {
    await controller.findAll('true');
    expect(mockService.findAll).toHaveBeenCalledWith(true);
  });

  it('findAll() defaults includeInactive to false when undefined', async () => {
    await controller.findAll(undefined);
    expect(mockService.findAll).toHaveBeenCalledWith(false);
  });

  it('findOne() returns a single bundle', async () => {
    const result = await controller.findOne('bundle-1');
    expect(mockService.findOne).toHaveBeenCalledWith('bundle-1');
    expect(result).toEqual(mockBundle);
  });

  it('findForProduct() returns bundles for a product', async () => {
    await controller.findForProduct('p-1');
    expect(mockService.findBundlesForProduct).toHaveBeenCalledWith('p-1');
  });

  it('create() passes dto to service', async () => {
    const dto = { name: 'Pack', productIds: ['p-1', 'p-2'], discountPercent: 20 } as any;
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('update() passes id and dto to service', async () => {
    await controller.update('bundle-1', { name: 'New Pack' });
    expect(mockService.update).toHaveBeenCalledWith('bundle-1', { name: 'New Pack' });
  });

  it('deactivate() calls service with id', async () => {
    const result = await controller.deactivate('bundle-1');
    expect(mockService.deactivate).toHaveBeenCalledWith('bundle-1');
    expect((result as any).isActive).toBe(false);
  });

  it('remove() calls service with id', async () => {
    await controller.remove('bundle-1');
    expect(mockService.remove).toHaveBeenCalledWith('bundle-1');
  });

  it('getStats() returns bundle stats', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });
});
