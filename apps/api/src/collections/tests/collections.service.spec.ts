import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CollectionsService } from '../collections.service';
import { Collection } from '../entities/collection.entity';

const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

function makeCollection(overrides: Partial<Collection> = {}): Collection {
  return {
    id: 'col-1',
    name: 'Summer Sale',
    slug: 'summer-sale',
    description: 'Hot summer deals',
    bannerImageUrl: null,
    productIds: ['p1', 'p2'],
    discountPercent: 10,
    isActive: true,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Collection;
}

describe('CollectionsService', () => {
  let service: CollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: getRepositoryToken(Collection), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('throws ConflictException if slug already exists', async () => {
      mockRepo.findOne.mockResolvedValue(makeCollection());

      await expect(service.create({ name: 'Dupe', slug: 'summer-sale' })).rejects.toThrow(ConflictException);
    });

    it('creates collection with default empty productIds', async () => {
      const created = makeCollection({ productIds: [] });
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      await service.create({ name: 'New Collection', slug: 'new-collection' });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ productIds: [] }),
      );
    });

    it('stores discount percent when provided', async () => {
      const created = makeCollection({ discountPercent: 20 });
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      await service.create({ name: 'Sale', slug: 'big-sale', discountPercent: 20 });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ discountPercent: 20 }),
      );
    });
  });

  describe('findActive', () => {
    it('excludes collections that have not started', async () => {
      const futureStart = makeCollection({ startsAt: new Date(Date.now() + 60_000) });
      const activeNow = makeCollection({ id: 'col-2', slug: 'active' });
      mockRepo.find.mockResolvedValue([futureStart, activeNow]);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('col-2');
    });

    it('excludes collections that have ended', async () => {
      const expired = makeCollection({ endsAt: new Date(Date.now() - 60_000) });
      const activeNow = makeCollection({ id: 'col-2', slug: 'active', endsAt: null });
      mockRepo.find.mockResolvedValue([expired, activeNow]);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('col-2');
    });

    it('includes collections with null startsAt and endsAt', async () => {
      const always = makeCollection({ startsAt: null, endsAt: null });
      mockRepo.find.mockResolvedValue([always]);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
    });
  });

  describe('findBySlug', () => {
    it('returns collection when found', async () => {
      const collection = makeCollection();
      mockRepo.findOne.mockResolvedValue(collection);

      const result = await service.findBySlug('summer-sale');

      expect(result).toEqual(collection);
    });

    it('throws NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addProduct', () => {
    it('adds productId if not already in list', async () => {
      const collection = makeCollection({ productIds: ['p1'] });
      mockRepo.findOne.mockResolvedValue(collection);
      mockRepo.save.mockResolvedValue({ ...collection, productIds: ['p1', 'p-new'] });

      const result = await service.addProduct('col-1', 'p-new');

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ productIds: ['p1', 'p-new'] }),
      );
    });

    it('does not duplicate if productId already exists', async () => {
      const collection = makeCollection({ productIds: ['p1', 'p2'] });
      mockRepo.findOne.mockResolvedValue(collection);

      await service.addProduct('col-1', 'p1');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('removeProduct', () => {
    it('removes productId from the list', async () => {
      const collection = makeCollection({ productIds: ['p1', 'p2', 'p3'] });
      mockRepo.findOne.mockResolvedValue(collection);
      mockRepo.save.mockResolvedValue({ ...collection, productIds: ['p1', 'p3'] });

      await service.removeProduct('col-1', 'p2');

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ productIds: ['p1', 'p3'] }),
      );
    });
  });

  describe('remove', () => {
    it('removes collection after finding it', async () => {
      const collection = makeCollection();
      mockRepo.findOne.mockResolvedValue(collection);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove('col-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(collection);
    });

    it('throws NotFoundException for unknown id', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
