import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('back_in_stock_subscriptions')
@Unique(['userId', 'variantId'])
@Index(['variantId', 'notified'])
export class BackInStockSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  @Index()
  userId: string;

  @Column({ length: 36 })
  variantId: string;

  @Column({ length: 36 })
  productId: string;

  @Column({ default: false })
  notified: boolean;

  @Column({ nullable: true })
  notifiedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
