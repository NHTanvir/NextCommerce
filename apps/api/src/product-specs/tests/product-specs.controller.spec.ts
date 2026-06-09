import { Test, TestingModule } from '@nestjs/testing';
import { ProductSpecsController } from '../product-specs.controller';
import { ProductSpecsService } from '../product-specs.service';

const mockSpec = { id: 'spec-1', productId: 'p-1', key: 'material', value: 'leather', sortOrder: 0, group: null, createdAt: '2025-01-01' };

const mockService: Partial<ProductSpecsService> = {
  findForProduct: jest.fn().mockResolvedValue([mockSpec]),
  findGrouped: jest.fn().mockResolvedValue({ material: [{ key: 'material', value: 'leather', id: 'spec-1' }] }),
  setSpec: jest.fn().mockResolvedValue(mockSpec),
  bulkSet: jest.fn().mockResolvedValue([mockSpec]),
  deleteSpec: jest.fn().mockResolvedValue(undefined),
  deleteAllForProduct: jest.fn().mockResolvedValue(undefined),
};

describe('ProductSpecsController', () => {
  let controller: ProductSpecsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSpecsController],
      providers: [{ provide: ProductSpecsService, useValue: mockService }],
    }).compile();

    controller = module.get(ProductSpecsController);
    jest.clearAllMocks();
  });

  it('findAll() delegates with productId', async () => {
    await controller.findAll('p-1');
    expect(mockService.findForProduct).toHaveBeenCalledWith('p-1');
  });

  it('findGrouped() delegates with productId', async () => {
    await controller.findGrouped('p-1');
    expect(mockService.findGrouped).toHaveBeenCalledWith('p-1');
  });

  it('setSpec() delegates productId and dto', async () => {
    const dto = { key: 'material', value: 'rubber' } as any;
    await controller.setSpec('p-1', dto);
    expect(mockService.setSpec).toHaveBeenCalledWith('p-1', dto);
  });

  it('bulkSet() delegates productId and specs array', async () => {
    const dto = { specs: [{ key: 'color', value: 'black' }] };
    await controller.bulkSet('p-1', dto);
    expect(mockService.bulkSet).toHaveBeenCalledWith('p-1', dto.specs);
  });

  it('deleteSpec() delegates specId and productId', async () => {
    await controller.deleteSpec('p-1', 'spec-1');
    expect(mockService.deleteSpec).toHaveBeenCalledWith('spec-1', 'p-1');
  });

  it('deleteAll() delegates productId', async () => {
    await controller.deleteAll('p-1');
    expect(mockService.deleteAllForProduct).toHaveBeenCalledWith('p-1');
  });
});
