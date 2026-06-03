import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('gift_cards')
export class GiftCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  @Index({ unique: true })
  code: string;

  @Column({ type: 'int', unsigned: true })
  initialAmountCents: number;

  @Column({ type: 'int', unsigned: true })
  remainingAmountCents: number;

  @Column({ nullable: true })
  purchasedByUserId: string | null;

  @Column({ nullable: true })
  redeemedByUserId: string | null;

  @Column({ nullable: true })
  recipientEmail: string | null;

  @Column({ nullable: true })
  recipientName: string | null;

  @Column({ nullable: true })
  message: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'datetime' })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
