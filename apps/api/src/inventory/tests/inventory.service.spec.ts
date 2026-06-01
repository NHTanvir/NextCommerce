import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from '../inventory.service';
import { ProductVariant } from '../../catalog/entities/product-variant.entity';
import { Product } from '../../catalog/entities/product.entity';

const mockVariantRepo = {
  findOne: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockProductRepo = {
  findOne: jest.fn(),
};

const buildVariant = (stockQty = 10): ProductVariant =>
  ({
    id: 'v1',
    sku: 'NIKE-AM-10-BLK',
    size: '10',
    color: 'Black',
    stockQty,
    priceCents: 12000,
  } as unknown as ProductVariant);

const buildProduct = (): Product =>
  ({
    id: 'p1',
    title: 'Nike Air Max',
    slug: 'nike-air-max',
    isActive: true,
    variants: [buildVariant(10), buildVariant(3)],
  } as unknown as Product);

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(ProductVariant), useValue: mockVariantRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  describe('getProductInventory', () => {
    it('returns inventory summary with total stock and low-stock count', async () => {
      mockProductRepo.findOne.mockResolvedValue(buildProduct());

      const result = await service.getProductInventory('p1');

      expect(result.productId).toBe('p1');
      expect(result.totalStock).toBe(13);
      expect(result.lowStockCount).toBe(1);
      expect(result.variants).toHaveLength(2);
    });

    it('throws NotFoundException for unknown product', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(service.getProductInventory('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjustStock', () => {
    it('adds delta to current stock', async () => {
      mockVariantRepo.findOne.mockResolvedValue(buildVariant(10));
      mockVariantRepo.update.mockResolvedValue({});

      const result = await service.adjustStock('v1', { delta: 5 });

      expect(mockVariantRepo.update).toHaveBeenCalledWith('v1', { stockQty: 15 });
      expect(result.stockQty).toBe(15);
    });

    it('allows reducing stock (negative delta)', async () => {
      mockVariantRepo.findOne.mockResolvedValue(buildVariant(10));
      mockVariantRepo.update.mockResolvedValue({});

      const result = await service.adjustStock('v1', { delta: -3 });

      expect(result.stockQty).toBe(7);
    });

    it('throws BadRequestException if delta would cause negative stock', async () => {
      mockVariantRepo.findOne.mockResolvedValue(buildVariant(2));
      await expect(service.adjustStock('v1', { delta: -5 })).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown variant', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);
      await expect(service.adjustStock('bad-id', { delta: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('setStock', () => {
    it('sets stock to exact quantity', async () => {
      mockVariantRepo.findOne.mockResolvedValue(buildVariant(10));
      mockVariantRepo.update.mockResolvedValue({});

      const result = await service.setStock('v1', { quantity: 25 });

      expect(mockVariantRepo.update).toHaveBeenCalledWith('v1', { stockQty: 25 });
      expect(result.stockQty).toBe(25);
    });

    it('throws NotFoundException for unknown variant', async () => {
      mockVariantRepo.findOne.mockResolvedValue(null);
      await expect(service.setStock('bad-id', { quantity: 10 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLowStockAlerts', () => {
    it('queries variants with stock below threshold', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([buildVariant(2)]),
      };
      mockVariantRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLowStockAlerts(5);

      expect(qb.where).toHaveBeenCalledWith('v.stockQty <= :threshold', { threshold: 5 });
      expect(result).toHaveLength(1);
    });
  });
});
