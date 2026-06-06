import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Address } from './entities/address.entity';
import { CartService } from '../cart/cart.service';
import { CatalogService } from '../catalog/catalog.service';
import { EventsService } from '../events/events.service';
import { CreateOrderDto, UpdateOrderStatusDto, BulkFulfillDto } from './dto/orders.dto';
import { ORDER_STATUS_TRANSITIONS, OrderStatus } from '@nextcommerce/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
    private readonly cartService: CartService,
    private readonly catalogService: CatalogService,
    private readonly eventsService: EventsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getOrCreate(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');

    let addressId = dto.addressId;
    if (!addressId && dto.address) {
      const addr = await this.addressRepo.save(
        this.addressRepo.create({ ...dto.address, userId }),
      );
      addressId = addr.id;
    }
    if (!addressId) throw new BadRequestException('Address required');

    let totalCents = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of cart.items) {
      const variant = await this.catalogService.findVariantById(item.variantId);
      if (variant.stockQty < item.quantity)
        throw new BadRequestException(`Insufficient stock for SKU ${variant.sku}`);

      const unitPrice = variant.priceCents;
      totalCents += unitPrice * item.quantity;
      orderItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPriceCents: unitPrice,
        productTitle: variant.product?.title || 'Unknown',
        size: variant.size,
        color: variant.color,
      });
    }

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        userId,
        addressId,
        totalCents,
        status: 'pending',
        paymentRef: null,
      }),
    );

    for (const item of orderItems) {
      await this.itemRepo.save(this.itemRepo.create({ ...item, orderId: order.id }));
      await this.catalogService.decrementStock(item.variantId!, item.quantity!);
    }

    await this.cartService.clearCart(cart.id);

    await this.eventsService.publish('order.placed', {
      orderId: order.id,
      userId,
      totalCents,
      placedAt: order.placedAt.toISOString(),
    });

    await this.updateStatus(order.id, 'paid', userId);

    return this.findOne(order.id);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      order: { placedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findPublic(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return {
      id: order.id,
      status: order.status,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      placedAt: order.placedAt,
      totalCents: order.totalCents,
      items: (order.items ?? []).map((i: any) => ({
        productTitle: i.productTitle ?? i.title ?? '',
        quantity: i.quantity,
      })),
    };
  }

  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    _actorId: string,
    trackingNumber?: string,
    carrier?: string,
  ): Promise<Order> {
    const order = await this.findOne(id);
    const allowed = ORDER_STATUS_TRANSITIONS[order.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition order from '${order.status}' to '${newStatus}'`,
      );
    }

    const updates: Partial<Order> = { status: newStatus };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (carrier) updates.carrier = carrier;

    await this.orderRepo.update(id, updates);

    if (newStatus === 'paid') {
      await this.eventsService.publish('order.paid', {
        orderId: id, userId: order.userId, paidAt: new Date().toISOString(),
      });
    } else if (newStatus === 'shipped') {
      await this.eventsService.publish('order.shipped', {
        orderId: id, userId: order.userId, shippedAt: new Date().toISOString(),
        trackingNumber: trackingNumber ?? null,
        carrier: carrier ?? null,
      });
    }

    return this.findOne(id);
  }

  async bulkFulfill(dto: BulkFulfillDto, actorId: string): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];

    for (const orderId of dto.orderIds) {
      try {
        await this.updateStatus(orderId, dto.status, actorId);
        success++;
      } catch (err: any) {
        errors.push(`${orderId}: ${err.message}`);
      }
    }

    return { success, errors };
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      order: { placedAt: 'DESC' },
    });
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Order[]; total: number }> {
    const [data, total] = await this.orderRepo.findAndCount({
      order: { placedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getOrderSummaryForUser(userId: string): Promise<{
    totalOrders: number;
    totalSpentCents: number;
    avgOrderValueCents: number;
    deliveredCount: number;
    pendingCount: number;
    cancelledCount: number;
    lastOrderAt: string | null;
  }> {
    const orders = await this.orderRepo.find({ where: { userId } });
    const totalOrders = orders.length;
    const totalSpentCents = orders.reduce((s, o) => s + (o.totalCents ?? 0), 0);
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
    const pendingCount = orders.filter((o) => ['pending', 'paid', 'processing'].includes(o.status)).length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
    const sorted = [...orders].sort((a, b) =>
      new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
    return {
      totalOrders,
      totalSpentCents,
      avgOrderValueCents: totalOrders > 0 ? Math.round(totalSpentCents / totalOrders) : 0,
      deliveredCount,
      pendingCount,
      cancelledCount,
      lastOrderAt: sorted[0]?.placedAt?.toISOString() ?? null,
    };
  }

  async exportToCsv(status?: string): Promise<string> {
    const where = status ? { status: status as OrderStatus } : {};
    const orders = await this.orderRepo.find({
      where,
      order: { placedAt: 'DESC' },
      relations: ['address'],
    });

    const escape = (v: string | null | undefined) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const header = [
      'Order ID', 'Status', 'Total (USD)', 'Items',
      'Tracking Number', 'Carrier',
      'Address Line 1', 'City', 'Country', 'Postal Code',
      'Placed At',
    ].join(',');

    const rows = orders.map((o) => {
      const itemsSummary = (o.items ?? [])
        .map((i) => `${i.productTitle} x${i.quantity}`)
        .join('; ');
      const addr = o.address;
      return [
        escape(o.id),
        escape(o.status),
        escape(((o.totalCents ?? 0) / 100).toFixed(2)),
        escape(itemsSummary),
        escape(o.trackingNumber),
        escape(o.carrier),
        escape(addr?.line1),
        escape(addr?.city),
        escape(addr?.country),
        escape(addr?.postalCode),
        escape(o.placedAt?.toISOString()),
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  async getStatusBreakdown(): Promise<Array<{ status: string; count: number; totalCents: number }>> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(o.id)', 'count')
      .addSelect('COALESCE(SUM(o.totalCents), 0)', 'totalCents')
      .groupBy('o.status')
      .orderBy('COUNT(o.id)', 'DESC')
      .getRawMany<{ status: string; count: string; totalCents: string }>();
    return rows.map((r) => ({
      status: r.status,
      count: Number(r.count),
      totalCents: Number(r.totalCents),
    }));
  }
}
