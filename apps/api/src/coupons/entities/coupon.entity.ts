import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DiscountType = 'percentage' | 'fixed';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 32 })
  code: string;

  @Column({ type: 'enum', enum: ['percentage', 'fixed'] })
  discountType: DiscountType;

  @Column({ type: 'int' })
  discountValue: number;

  @Column({ type: 'int', nullable: true })
  minOrderCents: number | null;

  @Column({ type: 'int', nullable: true })
  maxUsageCount: number | null;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
