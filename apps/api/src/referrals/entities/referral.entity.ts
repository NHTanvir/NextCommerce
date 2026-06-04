import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

export type ReferralStatus = 'pending' | 'completed' | 'paid';

@Entity('referrals')
@Index(['referrerId'])
@Unique(['refereeId'])
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36 })
  @Index()
  referrerId: string;

  @Column({ length: 36 })
  refereeId: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: ReferralStatus;

  @Column({ type: 'int', nullable: true })
  rewardPointsGranted: number | null;

  @Column({ nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
