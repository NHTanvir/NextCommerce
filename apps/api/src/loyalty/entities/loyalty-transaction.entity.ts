import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

export type LoyaltyTxType = 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund';

@Entity('loyalty_transactions')
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: ['earn', 'redeem', 'expire', 'bonus', 'refund'] })
  type: LoyaltyTxType;

  @Column({ type: 'int' })
  points: number;

  @Column({ nullable: true })
  orderId: string | null;

  @Column({ length: 200 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
