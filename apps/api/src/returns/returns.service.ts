import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest, ReturnStatus } from './entities/return-request.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateReturnDto, UpdateReturnStatusDto } from './dto/return.dto';

const ELIGIBLE_ORDER_STATUSES = ['delivered'] as const;

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly returnRepo: Repository<ReturnRequest>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(userId: string, dto: CreateReturnDto): Promise<ReturnRequest> {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Access denied');
    if (!ELIGIBLE_ORDER_STATUSES.includes(order.status as any)) {
      throw new BadRequestException('Only delivered orders can be returned');
    }

    const existing = await this.returnRepo.findOne({ where: { orderId: dto.orderId, userId } });
    if (existing) throw new BadRequestException('A return request already exists for this order');

    const request = this.returnRepo.create({
      userId,
      orderId: dto.orderId,
      reason: dto.reason,
      notes: dto.notes ?? null,
      status: 'pending',
    });
    return this.returnRepo.save(request);
  }

  async findByUser(userId: string): Promise<ReturnRequest[]> {
    return this.returnRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(status?: ReturnStatus): Promise<ReturnRequest[]> {
    return this.returnRepo.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async updateStatus(id: string, dto: UpdateReturnStatusDto): Promise<ReturnRequest> {
    const request = await this.returnRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Return request not found');

    request.status = dto.status;
    if (dto.adminNotes !== undefined) request.adminNotes = dto.adminNotes;
    return this.returnRepo.save(request);
  }

  async findOne(id: string, userId?: string): Promise<ReturnRequest> {
    const request = await this.returnRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Return request not found');
    if (userId && request.userId !== userId) throw new ForbiddenException('Access denied');
    return request;
  }
}
