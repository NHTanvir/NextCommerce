import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Not } from 'typeorm';
import { RecommendationsService } from '../recommendations.service';
import { Product } from '../entities/product.entity';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-default',
    slug: 'shoe',
    title: 'Default Shoe',
    brand: 'Nike',
    basePriceCents: 10000,
    categoryId: 'cat-1',
    isActive: true,
    images: [],
    category: { id: 'cat-1', name: 'Sneakers', slug: 'sneakers' } as any,
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [],
    tags: [],
    ...overrides,
  } as unknown as Product;
}

const mockProductRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
};

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    jest.clearAllMocks();
  });

  describe('getRelated', () => {
    it('returns empty when product not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      const result = await service.getRelated('non-existent');

      expect(result).toEqual({ products: [] });
    });

    it('labels same-brand products correctly', async () => {
      const target = makeProduct({ id: 'p1', brand: 'Nike', categoryId: 'cat-1' });
      const sameBrand = makeProduct({ id: 'p2', brand: 'Nike', categoryId: 'cat-2' });

      mockProductRepo.findOne.mockResolvedValue(target);
      mockProductRepo.find
        .mockResolvedValueOnce([sameBrand]) // same brand
        .mockResolvedValueOnce([]) // same category
        .mockResolvedValueOnce([]); // popular fallback

      const result = await service.getRelated('p1');

      expect(result.products[0].reason).toBe('same_brand');
      expect(result.products[0].id).toBe('p2');
    });

    it('labels same-category products correctly', async () => {
      const target = makeProduct({ id: 'p1', brand: 'Nike', categoryId: 'cat-1' });
      const sameCat = makeProduct({ id: 'p3', brand: 'Adidas', categoryId: 'cat-1' });

      mockProductRepo.findOne.mockResolvedValue(target);
      mockProductRepo.find
        .mockResolvedValueOnce([]) // same brand (none)
        .mockResolvedValueOnce([sameCat]) // same category
        .mockResolvedValueOnce([]); // popular fallback

      const result = await service.getRelated('p1');

      expect(result.products[0].reason).toBe('same_category');
      expect(result.products[0].id).toBe('p3');
    });

    it('deduplicates products across same_brand and same_category', async () => {
      const target = makeProduct({ id: 'p1', brand: 'Nike', categoryId: 'cat-1' });
      const shared = makeProduct({ id: 'p2', brand: 'Nike', categoryId: 'cat-1' });

      mockProductRepo.findOne.mockResolvedValue(target);
      mockProductRepo.find
        .mockResolvedValueOnce([shared]) // same brand
        .mockResolvedValueOnce([shared]) // same category (same product)
        .mockResolvedValueOnce([]); // popular fallback

      const result = await service.getRelated('p1');

      const ids = result.products.map((p) => p.id);
      expect(ids.filter((id) => id === 'p2').length).toBe(1);
    });

    it('fills remaining slots with popular when not enough brand/category matches', async () => {
      const target = makeProduct({ id: 'p1' });
      const popular = makeProduct({ id: 'p-pop', brand: 'Puma', categoryId: 'cat-99' });

      mockProductRepo.findOne.mockResolvedValue(target);
      mockProductRepo.find
        .mockResolvedValueOnce([]) // same brand
        .mockResolvedValueOnce([]) // same category
        .mockResolvedValueOnce([popular]); // popular fallback

      const result = await service.getRelated('p1');

      expect(result.products[0].reason).toBe('popular');
      expect(result.products[0].id).toBe('p-pop');
    });

    it('extracts imageUrl from first image', async () => {
      const target = makeProduct({ id: 'p1' });
      const related = makeProduct({
        id: 'p2',
        images: [{ url: 'https://cdn.test/img.jpg', alt: 'shoe' }] as any,
      });

      mockProductRepo.findOne.mockResolvedValue(target);
      mockProductRepo.find
        .mockResolvedValueOnce([related])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getRelated('p1');

      expect(result.products[0].imageUrl).toBe('https://cdn.test/img.jpg');
    });
  });

  describe('getTrending', () => {
    it('returns products labeled as popular', async () => {
      const products = [
        makeProduct({ id: 'p1' }),
        makeProduct({ id: 'p2' }),
      ];
      mockProductRepo.find.mockResolvedValue(products);

      const result = await service.getTrending(2);

      expect(result.products).toHaveLength(2);
      expect(result.products.every((p) => p.reason === 'popular')).toBe(true);
    });

    it('returns empty array when no active products', async () => {
      mockProductRepo.find.mockResolvedValue([]);

      const result = await service.getTrending();

      expect(result.products).toHaveLength(0);
    });

    it('passes limit to repository', async () => {
      mockProductRepo.find.mockResolvedValue([]);

      await service.getTrending(4);

      expect(mockProductRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 4 }),
      );
    });
  });
});
