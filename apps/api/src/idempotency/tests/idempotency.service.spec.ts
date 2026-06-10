import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdempotencyService } from '../idempotency.service';
import { IdempotencyKey } from '../entities/idempotency-key.entity';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('IdempotencyService', () => {
  let service: IdempotencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyService,
        { provide: getRepositoryToken(IdempotencyKey), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(IdempotencyService);
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('returns null when no row exists', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.find('abc-123');
      expect(result).toBeNull();
    });

    it('returns cached response for unexpired key', async () => {
      const future = new Date(Date.now() + 60_000);
      mockRepo.findOne.mockResolvedValue({
        key: 'abc-123',
        statusCode: 201,
        responseBody: { ok: true },
        expiresAt: future,
      });
      const result = await service.find('abc-123');
      expect(result).toEqual({ statusCode: 201, body: { ok: true } });
    });

    it('deletes and returns null for expired key', async () => {
      const past = new Date(Date.now() - 60_000);
      mockRepo.findOne.mockResolvedValue({
        key: 'abc-123',
        statusCode: 201,
        responseBody: { ok: true },
        expiresAt: past,
      });
      const result = await service.find('abc-123');
      expect(result).toBeNull();
      expect(mockRepo.delete).toHaveBeenCalledWith({ key: 'abc-123' });
    });
  });

  describe('store', () => {
    it('persists row with 24h expiry', async () => {
      mockRepo.create.mockImplementation((row) => row);
      mockRepo.save.mockResolvedValue({});

      const before = Date.now();
      await service.store({
        key: 'k1',
        userId: 'u1',
        route: 'POST /orders',
        statusCode: 201,
        body: { id: 'o1' },
      });
      const after = Date.now();

      const saved = mockRepo.save.mock.calls[0][0];
      expect(saved.key).toBe('k1');
      expect(saved.userId).toBe('u1');
      expect(saved.statusCode).toBe(201);
      expect(saved.responseBody).toEqual({ id: 'o1' });
      const ttl = saved.expiresAt.getTime();
      expect(ttl).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000);
      expect(ttl).toBeLessThanOrEqual(after + 24 * 60 * 60 * 1000 + 10);
    });
  });

  describe('purgeExpired', () => {
    it('returns affected rows count', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 7 });
      const n = await service.purgeExpired();
      expect(n).toBe(7);
    });

    it('returns 0 when affected is undefined', async () => {
      mockRepo.delete.mockResolvedValue({});
      const n = await service.purgeExpired();
      expect(n).toBe(0);
    });
  });
});
