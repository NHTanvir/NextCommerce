import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from '../catalog.controller';
import { CatalogService } from '../catalog.service';
import { ProductQueryDto } from '../dto/product-query.dto';
import { CreateProductDto } from '../dto/create-product.dto';

const mockService = {
  findAll: jest.fn(),
  findBySlug: jest.fn(),
  findCategories: jest.fn(),
  create: jest.fn(),
  decrementStock: jest.fn(),
};

describe('CatalogController', () => {
  let controller: CatalogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [{ provide: CatalogService, useValue: mockService }],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('delegates to service with query params', async () => {
      const query: ProductQueryDto = { page: 1, limit: 20 };
      const result = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      mockService.findAll.mockResolvedValue(result);

      const res = await controller.findAll(query);

      expect(mockService.findAll).toHaveBeenCalledWith(query);
      expect(res).toEqual(result);
    });

    it('passes search filter through', async () => {
      const query: ProductQueryDto = { page: 1, limit: 10, search: 'nike' };
      mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
      await controller.findAll(query);
      expect(mockService.findAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'nike' }));
    });

    it('passes category filter through', async () => {
      const query: ProductQueryDto = { page: 1, limit: 10, categoryId: 'cat-1' };
      mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
      await controller.findAll(query);
      expect(mockService.findAll).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'cat-1' }));
    });
  });

  describe('findOne', () => {
    it('delegates to findBySlug', async () => {
      const slug = 'nike-air-max-270';
      const product = { id: 'p1', slug, title: 'Nike Air Max 270' };
      mockService.findBySlug.mockResolvedValue(product);

      const res = await controller.findOne(slug);

      expect(mockService.findBySlug).toHaveBeenCalledWith(slug);
      expect(res).toEqual(product);
    });

    it('propagates NotFoundException from service', async () => {
      mockService.findBySlug.mockRejectedValue(new Error('Product not found'));
      await expect(controller.findOne('bad-slug')).rejects.toThrow('Product not found');
    });
  });

  describe('getCategories', () => {
    it('returns flat list of categories', async () => {
      const categories = [{ id: 'c1', name: 'Running' }];
      mockService.findCategories.mockResolvedValue(categories);
      const res = await controller.getCategories();
      expect(res).toEqual(categories);
    });
  });

  describe('create', () => {
    it('calls service.create and returns new product', async () => {
      const dto: CreateProductDto = {
        title: 'Test Shoe',
        slug: 'test-shoe',
        brand: 'TestBrand',
        basePriceCents: 9900,
        categoryId: 'cat-1',
        variants: [],
      };
      const created = { id: 'p-new', ...dto };
      mockService.create.mockResolvedValue(created);

      const res = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual(created);
    });
  });
});
