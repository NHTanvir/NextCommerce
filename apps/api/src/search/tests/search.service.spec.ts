import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from '../search.service';
import { Product } from '../../catalog/entities/product.entity';
import { Category } from '../../catalog/entities/category.entity';

function makeQb(results: any[] = []) {
  return {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(results),
    getRawMany: jest.fn().mockResolvedValue(results),
  };
}

const mockProductRepo = { createQueryBuilder: jest.fn() };
const mockCategoryRepo = { createQueryBuilder: jest.fn() };

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('returns empty result for blank query', async () => {
      const result = await service.search('  ');
      expect(result).toEqual({ query: '', total: 0, results: [] });
    });

    it('returns categories first, then products', async () => {
      const products = [
        { id: 'p1', slug: 'air-max', title: 'Air Max', brand: 'Nike', basePriceCents: 12000, images: [] },
      ];
      const categories = [
        { id: 'c1', name: 'Sneakers', slug: 'sneakers', imageUrl: null },
      ];

      mockProductRepo.createQueryBuilder.mockReturnValue(makeQb(products));
      mockCategoryRepo.createQueryBuilder.mockReturnValue(makeQb(categories));

      const result = await service.search('nike');

      expect(result.query).toBe('nike');
      expect(result.results[0].type).toBe('category');
      expect(result.results[1].type).toBe('product');
      expect(result.results[1].brand).toBe('Nike');
    });

    it('maps product images to imageUrl from first element', async () => {
      const products = [
        {
          id: 'p1', slug: 'shoe', title: 'Shoe', brand: 'Brand', basePriceCents: 5000,
          images: [{ url: 'https://cdn.example.com/shoe.jpg', alt: 'shoe' }],
        },
      ];
      mockProductRepo.createQueryBuilder.mockReturnValue(makeQb(products));
      mockCategoryRepo.createQueryBuilder.mockReturnValue(makeQb([]));

      const result = await service.search('shoe');

      expect(result.results[0].imageUrl).toBe('https://cdn.example.com/shoe.jpg');
    });

    it('handles product with no images gracefully', async () => {
      const products = [
        { id: 'p1', slug: 'shoe', title: 'Shoe', brand: 'Brand', basePriceCents: 5000, images: [] },
      ];
      mockProductRepo.createQueryBuilder.mockReturnValue(makeQb(products));
      mockCategoryRepo.createQueryBuilder.mockReturnValue(makeQb([]));

      const result = await service.search('shoe');

      expect(result.results[0].imageUrl).toBeUndefined();
    });

    it('limits total results to the specified limit', async () => {
      const manyProducts = Array.from({ length: 30 }, (_, i) => ({
        id: `p${i}`, slug: `shoe-${i}`, title: `Shoe ${i}`, brand: 'Brand',
        basePriceCents: 1000, images: [],
      }));
      mockProductRepo.createQueryBuilder.mockReturnValue(makeQb(manyProducts));
      mockCategoryRepo.createQueryBuilder.mockReturnValue(makeQb([]));

      const result = await service.search('shoe', 10);

      expect(result.results.length).toBeLessThanOrEqual(10);
    });
  });

  describe('autocomplete', () => {
    it('returns empty array for queries shorter than 2 characters', async () => {
      const result = await service.autocomplete('a');
      expect(result).toEqual([]);
      expect(mockProductRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('returns empty array for empty query', async () => {
      const result = await service.autocomplete('');
      expect(result).toEqual([]);
    });

    it('deduplicates brand and title suggestions', async () => {
      const rows = [
        { title: 'Nike Air Max', brand: 'Nike' },
        { title: 'Nike React', brand: 'Nike' },
      ];
      mockProductRepo.createQueryBuilder.mockReturnValue(makeQb(rows));

      const result = await service.autocomplete('ni');

      expect(result).toContain('Nike Air Max');
      expect(result).toContain('Nike React');
      expect(result).toContain('Nike');
      // no duplicate 'Nike'
      const nikeCount = result.filter((s) => s === 'Nike').length;
      expect(nikeCount).toBe(1);
    });

    it('only includes brand when it starts with the query', async () => {
      const rows = [
        { title: 'Jordan 1 High', brand: 'Jordan' },
      ];
      mockProductRepo.createQueryBuilder.mockReturnValue(makeQb(rows));

      const result = await service.autocomplete('jo');

      expect(result).toContain('Jordan');
    });

    it('limits suggestions to 8 entries', async () => {
      const rows = Array.from({ length: 20 }, (_, i) => ({
        title: `Product ${i}`,
        brand: 'Nike',
      }));
      mockProductRepo.createQueryBuilder.mockReturnValue(makeQb(rows));

      const result = await service.autocomplete('pro');

      expect(result.length).toBeLessThanOrEqual(8);
    });
  });
});
