import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CatalogService } from '../catalog.service';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { ProductVariant } from '../entities/product-variant.entity';

const buildProduct = (id = 'p1') =>
  ({
    id,
    title: 'Nike Air Max',
    slug: 'nike-air-max',
    brand: 'Nike',
    basePriceCents: 12000,
    isActive: true,
    variants: [],
    category: { name: 'Running' },
    images: [],
    createdAt: new Date(),
  } as unknown as Product);

const mockProductRepo = {
  findOne: jest.fn(),
  update: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockCategoryRepo = { find: jest.fn() };
const mockVariantRepo = {
  findOne: jest.fn(),
  decrement: jest.fn(),
  increment: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('CatalogService — update & delete', () => {
  let service: CatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: getRepositoryToken(ProductVariant), useValue: mockVariantRepo },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('updates allowed fields and returns refreshed product', async () => {
      const product = buildProduct();
      mockProductRepo.findOne
        .mockResolvedValueOnce(product)
        .mockResolvedValueOnce({ ...product, title: 'Updated Title' });
      mockProductRepo.update.mockResolvedValue({});

      const result = await service.update('p1', { title: 'Updated Title' });

      expect(mockProductRepo.update).toHaveBeenCalledWith('p1', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('throws NotFoundException for unknown id', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.update('bad-id', { title: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('only updates fields that are defined in the DTO', async () => {
      const product = buildProduct();
      mockProductRepo.findOne.mockResolvedValue(product).mockResolvedValue(product);
      mockProductRepo.update.mockResolvedValue({});

      await service.update('p1', { brand: 'Adidas' });

      const call = mockProductRepo.update.mock.calls[0][1];
      expect(call).toEqual({ brand: 'Adidas' });
      expect(call.title).toBeUndefined();
    });
  });

  describe('softDelete', () => {
    it('sets isActive to false', async () => {
      mockProductRepo.findOne.mockResolvedValue(buildProduct());
      mockProductRepo.update.mockResolvedValue({});

      await service.softDelete('p1');

      expect(mockProductRepo.update).toHaveBeenCalledWith('p1', { isActive: false });
    });

    it('throws NotFoundException for unknown id', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.softDelete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementStock', () => {
    it('increments variant stockQty', async () => {
      mockVariantRepo.increment.mockResolvedValue({});
      await service.incrementStock('v1', 5);
      expect(mockVariantRepo.increment).toHaveBeenCalledWith({ id: 'v1' }, 'stockQty', 5);
    });
  });

  describe('decrementStock', () => {
    it('decrements variant stockQty', async () => {
      mockVariantRepo.decrement.mockResolvedValue({});
      await service.decrementStock('v1', 2);
      expect(mockVariantRepo.decrement).toHaveBeenCalledWith({ id: 'v1' }, 'stockQty', 2);
    });
  });
});
