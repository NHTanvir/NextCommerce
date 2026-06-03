import { Entity, PrimaryGeneratedColumn, Column, Index, UpdateDateColumn } from 'typeorm';

@Entity('loyalty_accounts')
export class LoyaltyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  userId: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  points: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  lifetimePoints: number;

  @Column({ length: 20, default: 'bronze' })
  tier: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
