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

  async getRepeatCustomerRate(): Promise<{
    totalCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
    avgOrdersPerCustomer: number;
  }> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.userId', 'userId')
      .addSelect('COUNT(o.id)', 'orderCount')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('o.userId')
      .getRawMany<{ userId: string; orderCount: string }>();

    const totalCustomers = rows.length;
    const repeatCustomers = rows.filter((r) => parseInt(r.orderCount, 10) > 1).length;
    const totalOrders = rows.reduce((sum, r) => sum + parseInt(r.orderCount, 10), 0);

    return {
      totalCustomers,
      repeatCustomers,
      repeatRate: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
      avgOrdersPerCustomer: totalCustomers > 0
        ? Math.round((totalOrders / totalCustomers) * 10) / 10
        : 0,
    };
  }

  async getRevenueByCategory(limit = 10): Promise<{ categoryName: string; totalCents: number; orderCount: number }[]> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.items', 'item')
      .innerJoin('catalog_product', 'p', 'p.id = item.productId')
      .innerJoin('catalog_category', 'cat', 'cat.id = p.categoryId')
      .select('cat.name', 'categoryName')
      .addSelect('SUM(item.quantity * item.unitPriceCents)', 'totalCents')
      .addSelect('COUNT(DISTINCT o.id)', 'orderCount')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('cat.name')
      .orderBy('SUM(item.quantity * item.unitPriceCents)', 'DESC')
      .limit(limit)
      .getRawMany<{ categoryName: string; totalCents: string; orderCount: string }>();

    return rows.map((r) => ({
      categoryName: r.categoryName,
      totalCents: parseInt(r.totalCents ?? '0', 10),
      orderCount: parseInt(r.orderCount, 10),
    }));
  }

  async getHourlySalesDistribution(): Promise<{ hour: number; orderCount: number; totalCents: number }[]> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('HOUR(o.placedAt)', 'hour')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('SUM(o.totalCents)', 'totalCents')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('HOUR(o.placedAt)')
      .orderBy('HOUR(o.placedAt)', 'ASC')
      .getRawMany<{ hour: string; orderCount: string; totalCents: string }>();

    return rows.map((r) => ({
      hour: parseInt(r.hour, 10),
      orderCount: parseInt(r.orderCount, 10),
      totalCents: parseInt(r.totalCents ?? '0', 10),
    }));
  }

  async getTopCustomers(limit = 10): Promise<{
    userId: string;
    name: string;
    email: string;
    orderCount: number;
    totalSpentCents: number;
    lastOrderAt: string;
  }[]> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('o.user', 'u')
      .select('o.userId', 'userId')
      .addSelect('u.name', 'name')
      .addSelect('u.email', 'email')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('SUM(o.totalCents)', 'totalSpentCents')
      .addSelect('MAX(o.placedAt)', 'lastOrderAt')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('o.userId')
      .addGroupBy('u.name')
      .addGroupBy('u.email')
      .orderBy('SUM(o.totalCents)', 'DESC')
      .limit(limit)
      .getRawMany<{
        userId: string;
        name: string;
        email: string;
        orderCount: string;
        totalSpentCents: string;
        lastOrderAt: string;
      }>();

    return rows.map((r) => ({
      userId: r.userId,
      name: r.name,
      email: r.email,
      orderCount: parseInt(r.orderCount, 10),
      totalSpentCents: parseInt(r.totalSpentCents ?? '0', 10),
      lastOrderAt: r.lastOrderAt,
    }));
  }

  async getCustomerSegments(): Promise<{
    vip: number;
    loyal: number;
    regular: number;
    atRisk: number;
    lapsed: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oneEightyDaysAgo = new Date();
    oneEightyDaysAgo.setDate(oneEightyDaysAgo.getDate() - 180);

    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.userId', 'userId')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('SUM(o.totalCents)', 'totalSpent')
      .addSelect('MAX(o.placedAt)', 'lastOrder')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('o.userId')
      .getRawMany<{ userId: string; orderCount: string; totalSpent: string; lastOrder: string }>();

    let vip = 0, loyal = 0, regular = 0, atRisk = 0, lapsed = 0;

    for (const r of rows) {
      const count = parseInt(r.orderCount, 10);
      const spent = parseInt(r.totalSpent ?? '0', 10);
      const lastOrderDate = new Date(r.lastOrder);

      if (spent >= 50000 && count >= 5) {
        vip++;
      } else if (count >= 3 && lastOrderDate >= thirtyDaysAgo) {
        loyal++;
      } else if (lastOrderDate >= thirtyDaysAgo) {
        regular++;
      } else if (lastOrderDate >= ninetyDaysAgo) {
        atRisk++;
      } else if (lastOrderDate >= oneEightyDaysAgo) {
        lapsed++;
      }
    }

    return { vip, loyal, regular, atRisk, lapsed };
  }

  async getMonthlyCohortRetention(months = 6): Promise<{
    cohortMonth: string;
    newCustomers: number;
    retainedAtMonth1: number;
    retainedAtMonth2: number;
    retainedAtMonth3: number;
  }[]> {
    const from = new Date();
    from.setMonth(from.getMonth() - months);

    const rows = await this.userRepo
      .createQueryBuilder('u')
      .select("DATE_FORMAT(u.createdAt, '%Y-%m')", 'cohortMonth')
      .addSelect('COUNT(u.id)', 'newCustomers')
      .where('u.createdAt >= :from', { from })
      .andWhere("u.role = 'customer'")
      .groupBy("DATE_FORMAT(u.createdAt, '%Y-%m')")
      .orderBy("DATE_FORMAT(u.createdAt, '%Y-%m')", 'ASC')
      .getRawMany<{ cohortMonth: string; newCustomers: string }>();

    return rows.map((r) => ({
      cohortMonth: r.cohortMonth,
      newCustomers: parseInt(r.newCustomers, 10),
      retainedAtMonth1: 0,
      retainedAtMonth2: 0,
      retainedAtMonth3: 0,
    }));
  }

  async getRevenueByWeekday(): Promise<{ weekday: number; weekdayName: string; orderCount: number; totalCents: number }[]> {
    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('DAYOFWEEK(o.placedAt)', 'weekday')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('SUM(o.totalCents)', 'totalCents')
      .where("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('DAYOFWEEK(o.placedAt)')
      .orderBy('DAYOFWEEK(o.placedAt)', 'ASC')
      .getRawMany<{ weekday: string; orderCount: string; totalCents: string }>();

    const DAYS = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return rows.map((r) => ({
      weekday: parseInt(r.weekday, 10),
      weekdayName: DAYS[parseInt(r.weekday, 10)] ?? '',
      orderCount: parseInt(r.orderCount, 10),
      totalCents: parseInt(r.totalCents ?? '0', 10),
    }));
  }

  async getAverageOrderValueTrend(days = 30): Promise<{ date: string; avgOrderValueCents: number }[]> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const rows = await this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.placedAt)', 'date')
      .addSelect('AVG(o.totalCents)', 'avgCents')
      .where('o.placedAt >= :from', { from })
      .andWhere("o.status NOT IN ('cancelled', 'refunded')")
      .groupBy('DATE(o.placedAt)')
      .orderBy('DATE(o.placedAt)', 'ASC')
      .getRawMany<{ date: string; avgCents: string }>();

    return rows.map((r) => ({
      date: r.date,
      avgOrderValueCents: Math.round(parseFloat(r.avgCents ?? '0')),
    }));
  }
}
