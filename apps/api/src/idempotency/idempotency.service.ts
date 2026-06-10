import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { IdempotencyKey } from './entities/idempotency-key.entity';

const TTL_MS = 24 * 60 * 60 * 1000;

export interface CachedResponse {
  statusCode: number;
  body: unknown;
}

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly repo: Repository<IdempotencyKey>,
  ) {}

  /**
   * Look up a previously stored response for an idempotency key.
   * Expired entries are deleted and treated as a miss.
   */
  async find(key: string): Promise<CachedResponse | null> {
    const row = await this.repo.findOne({ where: { key } });
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await this.repo.delete({ key });
      return null;
    }
    return { statusCode: row.statusCode, body: row.responseBody };
  }

  async store(params: {
    key: string;
    userId: string | null;
    route: string;
    statusCode: number;
    body: unknown;
  }): Promise<void> {
    const row = this.repo.create({
      key: params.key,
      userId: params.userId,
      route: params.route,
      statusCode: params.statusCode,
      responseBody: params.body,
      expiresAt: new Date(Date.now() + TTL_MS),
    });
    await this.repo.save(row);
  }

  async purgeExpired(): Promise<number> {
    const result = await this.repo.delete({ expiresAt: LessThan(new Date()) });
    return result.affected ?? 0;
  }
}
