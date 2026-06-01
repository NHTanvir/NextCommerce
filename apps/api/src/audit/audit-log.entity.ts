import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type AuditAction =
  | 'user.login'
  | 'user.register'
  | 'user.logout'
  | 'order.create'
  | 'order.status_change'
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'coupon.create'
  | 'coupon.redeem'
  | 'inventory.adjust';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 64 })
  action: AuditAction;

  @Column({ nullable: true })
  resourceId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  resourceType: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ nullable: true, length: 45 })
  ipAddress: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
