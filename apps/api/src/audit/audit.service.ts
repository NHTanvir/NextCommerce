import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './audit-log.entity';

export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly logRepo: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.logRepo.save(
        this.logRepo.create({
          userId: dto.userId ?? null,
          action: dto.action,
          resourceId: dto.resourceId ?? null,
          resourceType: dto.resourceType ?? null,
          metadata: dto.metadata ?? null,
          ipAddress: dto.ipAddress ?? null,
        }),
      );
    } catch {
      // Audit logging should never fail silently for the main request
    }
  }

  async findByUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.logRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByAction(action: AuditAction, limit = 100): Promise<AuditLog[]> {
    return this.logRepo.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findRecent(limit = 100): Promise<AuditLog[]> {
    return this.logRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStats(): Promise<{
    total: number;
    last24h: number;
    byAction: Array<{ action: string; count: number }>;
  }> {
    const total = await this.logRepo.count();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24h = await this.logRepo.createQueryBuilder('a')
      .where('a.createdAt >= :since', { since })
      .getCount();

    const rows = await this.logRepo
      .createQueryBuilder('a')
      .select('a.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.action')
      .orderBy('COUNT(*)', 'DESC')
      .limit(20)
      .getRawMany<{ action: string; count: string }>();

    return {
      total,
      last24h,
      byAction: rows.map((r) => ({ action: r.action, count: Number(r.count) })),
    };
  }
}
