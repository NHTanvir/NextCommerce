import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CatalogService } from '../catalog.service';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { Category } from '../entities/category.entity';
import { EventsService } from '../../events/events.service';

const mockProductRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockVariantRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};
const mockCategoryRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};
const mockEventsService = { publish: jest.fn() };

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(ProductVariant), useValue: mockVariantRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();
    service = module.get<CatalogService>(CatalogService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('paginates products with default page/limit', async () => {
      mockProductRepo.findAndCount.mockResolvedValue([[], 0]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
    });
  });

  describe('findVariantById', () => {
    it('returns the variant when found', async () => {
      const variant = { id: 'v1', stockQty: 5, priceCents: 9999 };
      mockVariantRepo.findOne.mockResolvedValue(variant);
      const result = await service.findVariantById('v1');
      expect(result).toEqual(variant);
    });

    it('throws NotFoundException when variant not found', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);
      await expect(service.findVariantById('nonexistent')).rejects.toThrow('Variant not found');
    });
  });
});
