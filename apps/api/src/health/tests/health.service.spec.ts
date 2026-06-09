import { HealthService } from '../health.service';
import { DataSource } from 'typeorm';

const mockDataSource = {
  query: jest.fn(),
} as unknown as DataSource;

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HealthService(mockDataSource);
  });

  describe('isDbReady()', () => {
    it('returns true when DB responds', async () => {
      (mockDataSource.query as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);
      expect(await service.isDbReady()).toBe(true);
    });

    it('returns false when DB throws', async () => {
      (mockDataSource.query as jest.Mock).mockRejectedValue(new Error('connection refused'));
      expect(await service.isDbReady()).toBe(false);
    });
  });

  describe('getUptime()', () => {
    it('returns a positive number', () => {
      expect(service.getUptime()).toBeGreaterThan(0);
    });
  });

  describe('getMemoryUsage()', () => {
    it('returns rss, heapUsed, and heapTotal as MB strings', () => {
      const mem = service.getMemoryUsage();
      expect(mem.rss).toMatch(/^\d+MB$/);
      expect(mem.heapUsed).toMatch(/^\d+MB$/);
      expect(mem.heapTotal).toMatch(/^\d+MB$/);
    });
  });
});
