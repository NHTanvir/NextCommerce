import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

export interface RevenueByDay {
  date: string;
  totalCents: number;
  orderCount: number;
}

export interface TopProduct {
  productTitle: string;
  totalQuantity: number;
  totalRevenueCents: number;
}

export interface DashboardSummary {
  totalRevenueCents: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValueCents: number;
  pendingOrders: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getDashboardSummary(): Promise<DashboardSummary> {
    const [totalOrders, totalCustomers] = await Promise.all([
      this.orderRepo.count(),
      this.userRepo.count({ where: { role: 'customer' } }),
    ]);

    const revenueResult = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.totalCents)', 'total')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .getRawOne<{ total: string }>();

    const pendingResult = await this.orderRepo.count({ where: { status: 'pending' as any } });

    const totalRevenueCents = parseInt(revenueResult?.total || '0', 10);

    return {
      totalRevenueCents,
      totalOrders,
      totalCustomers,
      avgOrderValueCents: totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0,
      pendingOrders: pendingResult,
    };
  }

  async getRevenueByDay(days = 30): Promise<RevenueByDay[]> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.placedAt)', 'date')
      .addSelect('SUM(o.totalCents)', 'totalCents')
      .addSelect('COUNT(o.id)', 'orderCount')
      .where('o.placedAt >= :from', { from })
      .andWhere("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('DATE(o.placedAt)')
      .orderBy('DATE(o.placedAt)', 'ASC')
      .getRawMany<{ date: string; totalCents: string; orderCount: string }>();

    return rows.map((r) => ({
      date: r.date,
      totalCents: parseInt(r.totalCents, 10),
      orderCount: parseInt(r.orderCount, 10),
    }));
  }

  async getTopProducts(limit = 10): Promise<TopProduct[]> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'item')
      .select('item.productTitle', 'productTitle')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.quantity * item.unitPriceCents)', 'totalRevenueCents')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('item.productTitle')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit)
      .getRawMany<{ productTitle: string; totalQuantity: string; totalRevenueCents: string }>();

    return rows.map((r) => ({
      productTitle: r.productTitle,
      totalQuantity: parseInt(r.totalQuantity, 10),
      totalRevenueCents: parseInt(r.totalRevenueCents, 10),
    }));
  }

  async getOrderStatusBreakdown(): Promise<{ status: string; count: number; totalCents: number }[]> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(o.id)', 'count')
      .addSelect('SUM(o.totalCents)', 'totalCents')
      .groupBy('o.status')
      .orderBy('COUNT(o.id)', 'DESC')
      .getRawMany<{ status: string; count: string; totalCents: string }>();

    return rows.map((r) => ({
      status: r.status,
      count: parseInt(r.count, 10),
      totalCents: parseInt(r.totalCents ?? '0', 10),
    }));
  }

  async getNewCustomersByDay(days = 30): Promise<{ date: string; newCustomers: number }[]> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await this.userRepo
      .createQueryBuilder('u')
      .select('DATE(u.createdAt)', 'date')
      .addSelect('COUNT(u.id)', 'newCustomers')
      .where('u.createdAt >= :from', { from })
      .andWhere("u.role = 'customer'")
      .groupBy('DATE(u.createdAt)')
      .orderBy('DATE(u.createdAt)', 'ASC')
      .getRawMany<{ date: string; newCustomers: string }>();

    return rows.map((r) => ({
      date: r.date,
      newCustomers: parseInt(r.newCustomers, 10),
    }));
  }
}
