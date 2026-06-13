import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BundlesService } from '../bundles.service';
import { ProductBundle } from '../entities/bundle.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

function makeBundle(overrides: Partial<ProductBundle> = {}): ProductBundle {
  return {
    id: 'b-1',
    name: 'Starter Bundle',
    description: 'Save on essentials',
    productIds: ['p-1', 'p-2', 'p-3'],
    discountPercent: 15,
    discountAmountCents: null,
    isActive: true,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ProductBundle;
}

describe('BundlesService', () => {
  let service: BundlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundlesService,
        { provide: getRepositoryToken(ProductBundle), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<BundlesService>(BundlesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a bundle with deduped productIds', async () => {
      const bundle = makeBundle();
      mockRepo.create.mockReturnValue(bundle);
      mockRepo.save.mockResolvedValue(bundle);

      await service.create({
        name: 'Starter Bundle',
        productIds: ['p-1', 'p-2', 'p-1'],
        discountPercent: 15,
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productIds: ['p-1', 'p-2'],
        }),
      );
    });

    it('throws BadRequestException when fewer than 2 products', async () => {
      await expect(
        service.create({ name: 'Bad Bundle', productIds: ['p-1'], discountPercent: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findActive', () => {
    it('excludes bundles with future startsAt', async () => {
      const future = makeBundle({ startsAt: new Date(Date.now() + 86400000) });
      const active = makeBundle({ id: 'b-2' });
      mockRepo.find.mockResolvedValue([future, active]);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b-2');
    });

    it('excludes bundles with past endsAt', async () => {
      const expired = makeBundle({ endsAt: new Date(Date.now() - 86400000) });
      const active = makeBundle({ id: 'b-2' });
      mockRepo.find.mockResolvedValue([expired, active]);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b-2');
    });

    it('includes bundles with null dates', async () => {
      const bundle = makeBundle({ startsAt: null, endsAt: null });
      mockRepo.find.mockResolvedValue([bundle]);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
    });
  });

  describe('findBundlesForProduct', () => {
    it('returns bundles containing the product', async () => {
      const matching = makeBundle({ productIds: ['p-1', 'p-2'] });
      const nonMatching = makeBundle({ id: 'b-2', productIds: ['p-3', 'p-4'] });
      mockRepo.find.mockResolvedValue([matching, nonMatching]);

      const result = await service.findBundlesForProduct('p-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b-1');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for unknown bundle', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('sets isActive=false', async () => {
      const bundle = makeBundle();
      const deactivated = makeBundle({ isActive: false });
      mockRepo.findOne.mockResolvedValueOnce(bundle).mockResolvedValueOnce(deactivated);
      mockRepo.update.mockResolvedValue({});

      const result = await service.deactivate('b-1');

      expect(mockRepo.update).toHaveBeenCalledWith('b-1', { isActive: false });
      expect(result.isActive).toBe(false);
    });
  });

  describe('calculateBundlePrice', () => {
    it('applies discount percentage correctly', () => {
      expect(service.calculateBundlePrice(10000, 20)).toBe(8000);
      expect(service.calculateBundlePrice(9999, 10)).toBe(8999);
      expect(service.calculateBundlePrice(10000, 0)).toBe(10000);
    });
  });
});
