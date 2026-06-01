import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from '../audit.service';
import { AuditLog } from '../audit-log.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLog), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('saves a new audit log entry', async () => {
      const entry = { userId: 'u1', action: 'user.login' as const, ipAddress: '127.0.0.1' };
      mockRepo.create.mockReturnValue(entry);
      mockRepo.save.mockResolvedValue(entry);

      await service.log(entry);

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'user.login' }));
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('does not throw if save fails (silent fail)', async () => {
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockRejectedValue(new Error('DB error'));

      await expect(service.log({ action: 'user.login' })).resolves.not.toThrow();
    });

    it('sets null for optional fields when not provided', async () => {
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockResolvedValue({});

      await service.log({ action: 'product.create' });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          resourceId: null,
          ipAddress: null,
          metadata: null,
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('queries logs by userId with limit', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findByUser('u1', 25);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' }, take: 25 }),
      );
    });
  });

  describe('findRecent', () => {
    it('queries recent logs ordered by createdAt DESC', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findRecent(50);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'DESC' }, take: 50 }),
      );
    });
  });
});
