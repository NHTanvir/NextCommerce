import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type DiscountType = 'percentage' | 'fixed';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ['percentage', 'fixed'] })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderAmount: number | null;

  @Column({ type: 'int', nullable: true })
  usageLimit: number | null;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Index()
  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Index()
  @Column({ type: 'timestamp' })
  endsAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  applicableCategories: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
