import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterController } from '../newsletter.controller';
import { NewsletterService } from '../newsletter.service';
import type { Response } from 'express';

const mockService: Partial<NewsletterService> = {
  subscribe: jest.fn().mockResolvedValue({ success: true, email: 'user@test.com' }),
  unsubscribe: jest.fn().mockResolvedValue({ success: true }),
  getStats: jest.fn().mockResolvedValue({ total: 100, active: 80, unsubscribed: 20 }),
  getActiveCount: jest.fn().mockResolvedValue({ count: 80 }),
  findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  exportEmails: jest.fn().mockResolvedValue('email\nuser@test.com\n'),
};

describe('NewsletterController', () => {
  let controller: NewsletterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [{ provide: NewsletterService, useValue: mockService }],
    }).compile();

    controller = module.get(NewsletterController);
    jest.clearAllMocks();
  });

  it('subscribe() delegates email from dto', async () => {
    await controller.subscribe({ email: 'test@example.com' });
    expect(mockService.subscribe).toHaveBeenCalledWith('test@example.com');
  });

  it('unsubscribe() delegates token param', async () => {
    await controller.unsubscribe('token-abc');
    expect(mockService.unsubscribe).toHaveBeenCalledWith('token-abc');
  });

  it('getStats() delegates to service', async () => {
    const result = await controller.getStats();
    expect(mockService.getStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });

  it('getCount() delegates to service', async () => {
    await controller.getCount();
    expect(mockService.getActiveCount).toHaveBeenCalled();
  });

  it('listSubscribers() uses default page and limit', async () => {
    await controller.listSubscribers();
    expect(mockService.findAll).toHaveBeenCalledWith(1, 50);
  });

  it('listSubscribers() parses page and limit strings', async () => {
    await controller.listSubscribers('2', '25');
    expect(mockService.findAll).toHaveBeenCalledWith(2, 25);
  });

  it('exportEmails() calls service and returns StreamableFile', async () => {
    const mockRes = { set: jest.fn() } as unknown as Response;
    const result = await controller.exportEmails(mockRes);
    expect(mockService.exportEmails).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'text/csv' }),
    );
    expect(result).toBeDefined();
  });
});
