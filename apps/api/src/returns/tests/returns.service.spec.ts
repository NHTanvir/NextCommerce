import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReturnsService } from '../returns.service';
import { ReturnRequest } from '../entities/return-request.entity';
import { Order } from '../../orders/entities/order.entity';
import { CreateReturnDto } from '../dto/return.dto';

const mockReturnRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockOrderRepo = () => ({
  findOne: jest.fn(),
});

const userId = 'user-1';
const orderId = 'order-1';

const deliveredOrder = { id: orderId, userId, status: 'delivered' } as Order;

const createDto: CreateReturnDto = {
  orderId,
  reason: 'defective',
  notes: 'Item arrived broken',
};

describe('ReturnsService', () => {
  let service: ReturnsService;
  let returnRepo: ReturnType<typeof mockReturnRepo>;
  let orderRepo: ReturnType<typeof mockOrderRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnsService,
        { provide: getRepositoryToken(ReturnRequest), useFactory: mockReturnRepo },
        { provide: getRepositoryToken(Order), useFactory: mockOrderRepo },
      ],
    }).compile();

    service = module.get(ReturnsService);
    returnRepo = module.get(getRepositoryToken(ReturnRequest));
    orderRepo = module.get(getRepositoryToken(Order));
  });

  describe('create', () => {
    it('creates return for a delivered order', async () => {
      orderRepo.findOne.mockResolvedValue(deliveredOrder);
      returnRepo.findOne.mockResolvedValue(null);
      const request = { id: 'r1', ...createDto, userId, status: 'pending' };
      returnRepo.create.mockReturnValue(request);
      returnRepo.save.mockResolvedValue(request);

      const result = await service.create(userId, createDto);
      expect(result.status).toBe('pending');
    });

    it('throws NotFoundException if order not found', async () => {
      orderRepo.findOne.mockResolvedValue(null);
      await expect(service.create(userId, createDto)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if order belongs to different user', async () => {
      orderRepo.findOne.mockResolvedValue({ ...deliveredOrder, userId: 'other-user' });
      await expect(service.create(userId, createDto)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if order is not delivered', async () => {
      orderRepo.findOne.mockResolvedValue({ ...deliveredOrder, status: 'shipped' });
      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if return already exists', async () => {
      orderRepo.findOne.mockResolvedValue(deliveredOrder);
      returnRepo.findOne.mockResolvedValue({ id: 'existing-r1' });
      await expect(service.create(userId, createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUser', () => {
    it('returns returns for the user', async () => {
      const returns = [{ id: 'r1' }, { id: 'r2' }];
      returnRepo.find.mockResolvedValue(returns);
      const result = await service.findByUser(userId);
      expect(result).toBe(returns);
    });
  });

  describe('updateStatus', () => {
    it('updates status and adminNotes', async () => {
      const request = { id: 'r1', status: 'pending', adminNotes: null };
      returnRepo.findOne.mockResolvedValue(request);
      returnRepo.save.mockResolvedValue({ ...request, status: 'approved', adminNotes: 'Approved by admin' });

      const result = await service.updateStatus('r1', { status: 'approved', adminNotes: 'Approved by admin' });
      expect(result.status).toBe('approved');
    });

    it('throws NotFoundException if return not found', async () => {
      returnRepo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus('bad-id', { status: 'approved' })).rejects.toThrow(NotFoundException);
    });
  });
});
