import { Entity, PrimaryColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 200 })
  route: string;

  @Column({ type: 'int' })
  statusCode: number;

  @Column({ type: 'json' })
  responseBody: unknown;

  @Index()
  @Column({ type: 'datetime' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
