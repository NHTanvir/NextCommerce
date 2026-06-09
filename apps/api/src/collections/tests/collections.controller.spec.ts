import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from '../collections.controller';
import { CollectionsService } from '../collections.service';

const mockCollection = {
  id: 'col-1',
  name: 'Summer Sale',
  slug: 'summer-sale',
  description: null,
  isActive: true,
  productIds: ['p-1', 'p-2'],
  createdAt: '2025-01-01',
};

const mockService: Partial<CollectionsService> = {
  findActive: jest.fn().mockResolvedValue([mockCollection]),
  findAll: jest.fn().mockResolvedValue([mockCollection]),
  findBySlug: jest.fn().mockResolvedValue(mockCollection),
  create: jest.fn().mockResolvedValue(mockCollection),
  update: jest.fn().mockResolvedValue({ ...mockCollection, name: 'Winter Sale' }),
  addProduct: jest.fn().mockResolvedValue(mockCollection),
  removeProduct: jest.fn().mockResolvedValue(mockCollection),
  remove: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockResolvedValue({ total: 1, active: 1, inactive: 0, totalProducts: 2 }),
};

describe('CollectionsController', () => {
  let controller: CollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [{ provide: CollectionsService, useValue: mockService }],
    }).compile();

    controller = module.get(CollectionsController);
    jest.clearAllMocks();
  });

  it('findActive() returns active collections', async () => {
    const result = await controller.findActive();
    expect(mockService.findActive).toHaveBeenCalled();
    expect(result).toEqual([mockCollection]);
  });

  it('findBySlug() delegates to service', async () => {
    const result = await controller.findBySlug('summer-sale');
    expect(mockService.findBySlug).toHaveBeenCalledWith('summer-sale');
    expect(result).toEqual(mockCollection);
  });

  it('findAll() returns all including inactive', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledWith(true);
  });

  it('create() passes dto to service', async () => {
    const dto = { name: 'Summer Sale', slug: 'summer-sale' } as any;
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('update() passes id and dto', async () => {
    await controller.update('col-1', { name: 'Winter Sale' } as any);
    expect(mockService.update).toHaveBeenCalledWith('col-1', { name: 'Winter Sale' });
  });

  it('addProduct() passes id and productId', async () => {
    await controller.addProduct('col-1', 'p-3');
    expect(mockService.addProduct).toHaveBeenCalledWith('col-1', 'p-3');
  });

  it('removeProduct() passes id and productId', async () => {
    await controller.removeProduct('col-1', 'p-2');
    expect(mockService.removeProduct).toHaveBeenCalledWith('col-1', 'p-2');
  });

  it('remove() passes id', async () => {
    await controller.remove('col-1');
    expect(mockService.remove).toHaveBeenCalledWith('col-1');
  });

  it('getStats() returns stats', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });
});
