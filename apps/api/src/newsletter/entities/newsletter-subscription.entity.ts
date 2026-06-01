import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('newsletter_subscriptions')
export class NewsletterSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  unsubscribeToken: string | null;

  @CreateDateColumn()
  subscribedAt: Date;
}
