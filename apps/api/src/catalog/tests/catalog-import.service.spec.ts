import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CatalogImportService } from '../catalog-import.service';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';

const mockProductRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  create: jest.fn((d) => d),
};

const mockCategoryRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn((d) => d),
};

const VALID_CSV = `title,slug,brand,description,basePriceCents,categoryName,imageUrl
Air Max 90,air-max-90,Nike,Classic runner,14999,Sneakers,https://example.com/img.jpg
Jordan 1,jordan-1,Nike,,18999,Basketball,`;

describe('CatalogImportService', () => {
  let service: CatalogImportService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CatalogImportService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();
    service = module.get(CatalogImportService);
  });

  describe('parseCsv', () => {
    it('throws when fewer than 2 lines', () => {
      expect(() => service.parseCsv('')).toThrow(BadRequestException);
      expect(() => service.parseCsv('header only')).toThrow(BadRequestException);
    });

    it('throws when required column is missing', () => {
      const csv = 'title,brand\nFoo,Bar';
      expect(() => service.parseCsv(csv)).toThrow(BadRequestException);
    });

    it('parses valid CSV into rows', () => {
      const rows = service.parseCsv(VALID_CSV);
      expect(rows).toHaveLength(2);
      expect(rows[0].title).toBe('Air Max 90');
      expect(rows[0].basePriceCents).toBe(14999);
      expect(rows[0].isActive).toBe(true);
    });

    it('sets isActive to false when column value is "false"', () => {
      const csv = `title,slug,brand,basePriceCents,categoryName,isActive\nFoo,foo,Bar,999,Cat,false`;
      const rows = service.parseCsv(csv);
      expect(rows[0].isActive).toBe(false);
    });
  });

  describe('importRows', () => {
    it('creates new products with new category', async () => {
      const category = { id: 'cat-1', name: 'Sneakers', slug: 'sneakers' };
      mockCategoryRepo.findOne.mockResolvedValue(null);
      mockCategoryRepo.save.mockResolvedValue(category);
      mockProductRepo.findOne.mockResolvedValue(null);
      mockProductRepo.save.mockResolvedValue({});

      const rows = service.parseCsv(VALID_CSV);
      const result = await service.importRows(rows.slice(0, 1));

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('updates existing products', async () => {
      const category = { id: 'cat-1', name: 'Sneakers', slug: 'sneakers' };
      const existing = { id: 'prod-1', slug: 'air-max-90', images: [] };
      mockCategoryRepo.findOne.mockResolvedValue(category);
      mockProductRepo.findOne.mockResolvedValue(existing);
      mockProductRepo.update.mockResolvedValue({});

      const rows = service.parseCsv(VALID_CSV);
      const result = await service.importRows(rows.slice(0, 1));

      expect(result.updated).toBe(1);
      expect(result.created).toBe(0);
    });

    it('skips rows with invalid basePriceCents', async () => {
      const rows = [{ title: 'T', slug: 's', brand: 'B', basePriceCents: NaN, categoryName: 'C' }];
      const result = await service.importRows(rows);
      expect(result.skipped).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('skips rows with missing required fields', async () => {
      const rows = [{ title: '', slug: '', brand: '', basePriceCents: 100, categoryName: '' }];
      const result = await service.importRows(rows);
      expect(result.skipped).toBe(1);
    });

    it('reuses cached category across rows', async () => {
      const category = { id: 'cat-1', name: 'Sneakers', slug: 'sneakers' };
      mockCategoryRepo.findOne.mockResolvedValue(null);
      mockCategoryRepo.save.mockResolvedValue(category);
      mockProductRepo.findOne.mockResolvedValue(null);
      mockProductRepo.save.mockResolvedValue({});

      const rows = service.parseCsv(VALID_CSV);
      // Both rows have different categories, but let's use same
      const sameCategory = rows.map((r) => ({ ...r, categoryName: 'Sneakers' }));
      await service.importRows(sameCategory);

      // findOne called once per distinct category name (cached after first)
      expect(mockCategoryRepo.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
