import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from '../metrics.controller';
import { MetricsService } from '../metrics.service';

const mockService: Partial<MetricsService> = {
  getMetrics: jest.fn().mockResolvedValue('# HELP nextcommerce_http_request_duration_seconds\n# TYPE nextcommerce_http_request_duration_seconds histogram\n'),
};

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [{ provide: MetricsService, useValue: mockService }],
    }).compile();

    controller = module.get(MetricsController);
    jest.clearAllMocks();
  });

  it('metrics() returns a prometheus-format string', async () => {
    const result = await controller.metrics();
    expect(mockService.getMetrics).toHaveBeenCalled();
    expect(typeof result).toBe('string');
    expect(result).toContain('nextcommerce_http_request_duration_seconds');
  });
});
