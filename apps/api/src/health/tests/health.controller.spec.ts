import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';

const mockHealth = {
  isDbReady: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealth }],
    }).compile();

    controller = module.get(HealthController);
    jest.clearAllMocks();
  });

  describe('live()', () => {
    it('returns status ok', () => {
      const result = controller.live();
      expect(result.status).toBe('ok');
    });

    it('includes a timestamp string', () => {
      const result = controller.live();
      expect(typeof result.timestamp).toBe('string');
      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });

  describe('ready()', () => {
    it('returns ok with database=up when DB is reachable', async () => {
      mockHealth.isDbReady.mockResolvedValue(true);
      const result = await controller.ready();
      expect(result.status).toBe('ok');
      expect(result.dependencies.database).toBe('up');
    });

    it('throws 503 with degraded body when DB is down', async () => {
      mockHealth.isDbReady.mockResolvedValue(false);
      let caught: HttpException | undefined;
      try {
        await controller.ready();
      } catch (err) {
        caught = err as HttpException;
      }
      expect(caught).toBeInstanceOf(HttpException);
      expect(caught!.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const body = caught!.getResponse() as { status: string; dependencies: { database: string } };
      expect(body.status).toBe('degraded');
      expect(body.dependencies.database).toBe('down');
    });
  });
});
