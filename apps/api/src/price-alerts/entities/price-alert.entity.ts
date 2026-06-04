import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('price_alerts')
@Unique(['userId', 'productId'])
@Index(['productId'])
export class PriceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  @Index()
  userId: string;

  @Column({ length: 36 })
  productId: string;

  @Column({ type: 'int', nullable: true })
  targetPriceCents: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastTriggeredAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
