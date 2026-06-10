import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get(HealthController);
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
    it('returns status ok', () => {
      const result = controller.ready();
      expect(result.status).toBe('ok');
    });

    it('includes a timestamp string', () => {
      const result = controller.ready();
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
