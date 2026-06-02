import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagsService } from '../tags.service';
import { ProductTag } from '../../catalog/entities/product-tag.entity';

const mockRepo = () => ({
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('TagsService', () => {
  let service: TagsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(ProductTag), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(TagsService);
    repo = module.get(getRepositoryToken(ProductTag));
  });

  describe('findAll', () => {
    it('returns distinct tag names from query builder', async () => {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { name: 'basketball' },
          { name: 'running' },
        ]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.findAll();
      expect(result).toEqual(['basketball', 'running']);
    });

    it('returns empty array when no tags', async () => {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('findProductsByTag', () => {
    it('returns productId array for given tag', async () => {
      repo.find.mockResolvedValue([
        { productId: 'p1', name: 'running' },
        { productId: 'p2', name: 'running' },
      ]);
      const result = await service.findProductsByTag('running');
      expect(result).toEqual(['p1', 'p2']);
    });
  });

  describe('addTag', () => {
    it('creates tag if not existing', async () => {
      repo.findOne.mockResolvedValue(null);
      const tag = { id: 1, productId: 'p1', name: 'trail' };
      repo.create.mockReturnValue(tag);
      repo.save.mockResolvedValue(tag);
      await service.addTag('p1', 'trail');
      expect(repo.save).toHaveBeenCalledWith(tag);
    });

    it('skips save if tag already exists (idempotent)', async () => {
      repo.findOne.mockResolvedValue({ id: 1, productId: 'p1', name: 'trail' });
      await service.addTag('p1', 'trail');
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('removeTag', () => {
    it('calls delete with productId and name', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await service.removeTag('p1', 'trail');
      expect(repo.delete).toHaveBeenCalledWith({ productId: 'p1', name: 'trail' });
    });
  });
});
