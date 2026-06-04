import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductSpecsService } from '../product-specs.service';
import { ProductSpec } from '../entities/product-spec.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
};

function makeSpec(overrides: Partial<ProductSpec> = {}): ProductSpec {
  return {
    id: 's-1',
    productId: 'p-1',
    key: 'Material',
    value: 'Mesh',
    sortOrder: 0,
    group: 'Construction',
    createdAt: new Date(),
    ...overrides,
  } as ProductSpec;
}

describe('ProductSpecsService', () => {
  let service: ProductSpecsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSpecsService,
        { provide: getRepositoryToken(ProductSpec), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProductSpecsService>(ProductSpecsService);
    jest.clearAllMocks();
  });

  describe('setSpec', () => {
    it('creates new spec when key does not exist', async () => {
      const spec = makeSpec();
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(spec);
      mockRepo.save.mockResolvedValue(spec);

      const result = await service.setSpec('p-1', { key: 'Material', value: 'Mesh', group: 'Construction' });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ productId: 'p-1', key: 'Material', value: 'Mesh' }),
      );
      expect(result).toEqual(spec);
    });

    it('updates existing spec when key already exists', async () => {
      const existing = makeSpec({ value: 'Leather' });
      const updated = makeSpec({ value: 'Mesh' });
      mockRepo.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);
      mockRepo.update.mockResolvedValue({});

      const result = await service.setSpec('p-1', { key: 'Material', value: 'Mesh' });

      expect(mockRepo.update).toHaveBeenCalledWith(
        existing.id,
        expect.objectContaining({ value: 'Mesh' }),
      );
      expect(result.value).toBe('Mesh');
    });
  });

  describe('findForProduct', () => {
    it('returns specs ordered by sortOrder then key', async () => {
      const specs = [makeSpec()];
      mockRepo.find.mockResolvedValue(specs);

      const result = await service.findForProduct('p-1');

      expect(result).toEqual(specs);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: 'p-1' },
          order: { sortOrder: 'ASC', key: 'ASC' },
        }),
      );
    });
  });

  describe('findGrouped', () => {
    it('groups specs by group name', async () => {
      const specs = [
        makeSpec({ key: 'Material', value: 'Mesh', group: 'Construction' }),
        makeSpec({ id: 's-2', key: 'Weight', value: '230g', group: 'Dimensions' }),
        makeSpec({ id: 's-3', key: 'Color', value: 'Black', group: 'Construction' }),
      ];
      mockRepo.find.mockResolvedValue(specs);

      const result = await service.findGrouped('p-1');

      expect(result['Construction']).toHaveLength(2);
      expect(result['Dimensions']).toHaveLength(1);
    });

    it('uses "General" as default group when group is null', async () => {
      const spec = makeSpec({ group: null });
      mockRepo.find.mockResolvedValue([spec]);

      const result = await service.findGrouped('p-1');

      expect(result['General']).toHaveLength(1);
    });
  });

  describe('deleteSpec', () => {
    it('removes spec when found', async () => {
      const spec = makeSpec();
      mockRepo.findOne.mockResolvedValue(spec);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.deleteSpec('s-1', 'p-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(spec);
    });

    it('throws NotFoundException for unknown spec', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteSpec('bad-id', 'p-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkSet', () => {
    it('calls setSpec for each item in the array', async () => {
      const spec1 = makeSpec({ key: 'Material', value: 'Mesh' });
      const spec2 = makeSpec({ id: 's-2', key: 'Weight', value: '230g' });

      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValueOnce(spec1).mockReturnValueOnce(spec2);
      mockRepo.save.mockResolvedValueOnce(spec1).mockResolvedValueOnce(spec2);

      const result = await service.bulkSet('p-1', [
        { key: 'Material', value: 'Mesh' },
        { key: 'Weight', value: '230g' },
      ]);

      expect(result).toHaveLength(2);
    });
  });
});
